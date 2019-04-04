import Hammer from 'hammerjs';

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
 * Expand elements by panning out of view
 * @param {HTMLElement} target
 */
const expand = target => {
  target.classList.add('transition', 'expanded');
  target.classList.remove('dragging', 'collapsed');
  const idx = target.getAttribute('data-index');
  const offset = 10 + 5 * +idx;
  const top = +target.style.top.match(/[-]?\d+/)[0];
  const y = (window.innerHeight * (-top + offset)) / 100;
  target.style.transform = `translateY(${y}px)`;
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
 * Translate the y position of the element on drag
 * @param {HTMLElement} section
 * @param {number} deltaY
 */
const drag = (section, deltaY) => {
  section.style.transitionDelay = 'unset';
  section.classList.remove('transition');
  section.classList.add('dragging');
  section.style.transform = `translateY(${deltaY}px)`;
};

/**
 * Initialize the stack interaction
 * @param {string} mediaQuery
 * @param {number} [threshold=400]
 */
module.exports = (mediaQuery, threshold = -300) => {
  const sections = Array.from(document.getElementsByTagName('section'));
  const [background, ...draggable] = sections;
  let currentPosition = 0;

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
   * Change all sections
   * @param {function} execute
   */
  const changeSections = shouldExpand => {
    for (let i = draggable.length - 1; i >= 0; i--) {
      const { classList } = draggable[i];
      if (classList.contains('dragging')) {
        if (shouldExpand) {
          draggable.slice(0, i + 1).forEach(expand);
        } else {
          draggable.slice(i).forEach(collapse);
        }
      }
    }
  };

  /**
   * Get delta from pan movement
   * @param {Event} evt
   */
  const pan = evt => {
    currentPosition = 0;
    const target = evt.currentTarget || evt.srcElement;
    const deltaY = +target.style.transform.match(/[-]?\d+/)[0];
    target.classList.remove('collapsed');
    changeSections(threshold > deltaY);
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
    section.addEventListener('mouseup', pan);
    section.addEventListener('touchend', pan);

    hammer.on('panup pandown', ({ deltaY }) => {
      const section = draggable[i];
      const isExpanded = section.classList.contains('expanded');
      if (isExpanded) {
        if (!section.classList.contains('dragging')) {
          currentPosition = +section.style.transform.match(/[-]?\d+/)[0];
        }
        draggable.slice(i).forEach(section => !section.classList.contains('collapsed') && drag(section, currentPosition + deltaY));
      } else {
        draggable.slice(0, i + 1).forEach(section => !section.classList.contains('expanded') && drag(section, deltaY));
      }
    });
  });
};
