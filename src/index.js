import initInteractions from './interactions.js';

/**
 * Remove class if javascript is available
 */
document.getElementsByTagName('html')[0].classList.remove('no-js');

const mediaQueries = [
  { key: 'mobileLandscape', query: '(min-width: 481px) and (max-width: 1024px) and (orientation: landscape)' },
  { key: 'xl', query: '(min-width: 1200px)' },
  { key: 'lg', query: '(min-width: 992px)' },
  { key: 'md', query: '(min-width: 768px)' },
  { key: 's', query: '(min-width: 576px)' },
];

const { key } = mediaQueries.find(({ query }) => window.matchMedia(query).matches) || { key: 'xs' };

initInteractions(key);
