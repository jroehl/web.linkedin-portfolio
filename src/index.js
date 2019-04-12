import initInteractions from './interactions.js';
/*
 * Remove class if javascript is available
 */
document.documentElement.classList.remove('no-js');

const { config } = window;

if (config.hasGA) {
  window.gtag = window.gtag || console.info;
} else {
  window.gtag = function() {};
}

const mediaQueries = [
  { key: 'mobileLandscape', query: '(min-width: 481px) and (max-width: 1024px) and (orientation: landscape)' },
  { key: 'xl', query: '(min-width: 1200px)' },
  { key: 'lg', query: '(min-width: 992px)' },
  { key: 'md', query: '(min-width: 768px)' },
  { key: 's', query: '(min-width: 576px)' },
];

Array.from(document.querySelectorAll('a')).forEach(
  el =>
    (el.onclick = ({ target }) => {
      window.gtag('event', 'a_click', { event_category: 'click', event_label: 'links', href: target.href });
    })
);

let currentIdx = 1;
const main = document.querySelector('main');
const invertBtn = document.querySelector('i.fas.fa-palette.invert');
invertBtn.onclick = () => {
  const currentClass = config.palettes[currentIdx++ % config.palettes.length];
  main.classList = currentClass === 'color' ? '' : currentClass;
  window.gtag('event', 'invert_click', { event_category: 'click', event_label: 'ui', color: currentClass });
};

const { key } = mediaQueries.find(({ query }) => window.matchMedia(query).matches) || { key: 'xs' };

initInteractions(key);
