import Hammer from 'hammerjs';

const timeouts = [];

/**
 * Collapse elements by panning to original position
 * @param {HTMLElement} target
 */
const collapse = target => {
  target.classList.add('transition', 'collapsed');
  target.classList.remove('expanded', 'dragging', 'clicked');
  target.style.transform = 'translateY(0px)';
};

/**
 * Collapse all sections
 * @param {array<HTMLElement>} elements
 */
const reset = elements =>
  elements.forEach(element => {
    element.style.animation = 'unset';
    collapse(element);
  });

/**
 * Drag section array
 * @param {array<HTMLElement>} sections
 * @param {string} className
 * @param {number} deltaY
 */
const dragSections = (sections, className, deltaY) =>
  sections.forEach(section => {
    if (!section.classList.contains(className)) drag(section, deltaY);
  });

/**
 * Translate the y position of the element on drag
 * @param {HTMLElement} section
 * @param {number} deltaY
 */
const drag = (section, deltaY) => {
  timeouts.forEach(clearTimeout);
  section.style.bottom = '-300%';
  section.style.height = 'unset';
  section.style.transitionDelay = 'unset';
  section.classList.remove('transition');
  section.classList.add('dragging');
  section.style.transform = `translateY(${deltaY}px)`;
};

/**
 * Initialize the stack interaction
 * @param {string} mediaQuery
 * @param {number} [threshold=100]
 */
module.exports = (mediaQuery, threshold = 100) => {
  const sections = Array.from(document.querySelectorAll('section'));
  const [background, ...draggable] = sections;
  let initialPosition = 0;
  const expandedY = (window.innerHeight * (draggable.length + 1)) / -10;

  if (!background) throw new Error('No <section> tags in dom');

  document.body.addEventListener('click', () => reset(draggable));

  if (mediaQuery === 'xl') {
    draggable.forEach(el =>
      el.addEventListener('click', evt => {
        evt.stopPropagation();
        el.classList.toggle('clicked');
      })
    );
    return;
  }

  reset(draggable);

  /**
   * Expand elements by panning out of view
   * @param {HTMLElement} target
   */
  const expand = target => {
    target.classList.add('transition', 'expanded');
    target.classList.remove('dragging', 'collapsed');
    const idx = target.getAttribute('data-index');
    target.style.transform = `translateY(${expandedY}px)`;
    timeouts.push(
      setTimeout(() => {
        target.style.height = `${90 - 5 * idx}%`;
        target.style.bottom = '0';
      }, 1000)
    );
  };

  /**
   * Get delta from pan movement
   * @param {Event} evt
   */
  const pan = evt => {
    evt.preventDefault();
    const target = evt.currentTarget || evt.srcElement;
    const deltaY = +target.style.transform.match(/[-]?\d+/)[0];
    const idx = target.getAttribute('data-index');
    const clickExpand = deltaY === initialPosition && !deltaY && !initialPosition;
    const shouldExpand = initialPosition - threshold > deltaY || clickExpand;
    if (!shouldExpand) {
      draggable.slice(idx - 1).forEach(collapse);
    } else {
      const sections = [...draggable];
      const stacked = sections.splice(0, idx);
      const dragging = sections.filter(({ classList }) => classList.contains('dragging'));
      [...stacked, ...dragging].forEach(expand);
    }
  };

  const setInitialPosition = evt => {
    evt.preventDefault();
    const target = evt.currentTarget || evt.srcElement;
    initialPosition = +target.style.transform.match(/[-]?\d+/)[0];
  };

  draggable.forEach((section, i) => {
    const hammer = new Hammer(section);
    section.addEventListener(
      'touchmove',
      e => {
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false }
    );
    section.addEventListener('mousedown', setInitialPosition);
    section.addEventListener('touchstart', setInitialPosition);
    section.addEventListener('mouseup', pan);
    section.addEventListener('touchend', pan);

    hammer.on('panup pandown', ({ deltaY }) => {
      const section = draggable[i];
      const isExpanded = section.classList.contains('expanded');
      if (isExpanded) {
        dragSections(draggable.slice(i), 'collapsed', initialPosition + deltaY);
      } else {
        dragSections(draggable.slice(0, i + 1), 'expanded', deltaY);
      }
    });
  });
};
