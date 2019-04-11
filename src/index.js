import initInteractions from './interactions.js';

const { palettes } = window;
/**
 * Remove class if javascript is available
 */
document.documentElement.classList.remove('no-js');

const mediaQueries = [
  { key: 'mobileLandscape', query: '(min-width: 481px) and (max-width: 1024px) and (orientation: landscape)' },
  { key: 'xl', query: '(min-width: 1200px)' },
  { key: 'lg', query: '(min-width: 992px)' },
  { key: 'md', query: '(min-width: 768px)' },
  { key: 's', query: '(min-width: 576px)' },
];

let currentIdx = 1;
const main = document.querySelector('main');
const invertBtn = document.querySelector('i.fas.fa-palette.invert');
invertBtn.onclick = () => {
  const currentClass = palettes[currentIdx++ % palettes.length];
  main.classList = currentClass === 'color' ? '' : currentClass;
};

const { key } = mediaQueries.find(({ query }) => window.matchMedia(query).matches) || { key: 'xs' };

initInteractions(key);
