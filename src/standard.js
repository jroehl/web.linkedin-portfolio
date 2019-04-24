import 'cookieconsent';

/*
 * Remove class if javascript is available
 */
document.documentElement.classList.remove('no-js');

const { config } = window;

if (config.hasGA) {
  window.cookieconsent.initialise(
    {
      theme: 'edgeless',
      autoOpen: false,
      content: { href: '/privacy-policy' },
    },
    popup => {
      if (!popup.hasAnswered() || !popup.hasConsented()) {
        setTimeout(() => popup.open(), 2000);
      }
    }
  );
  window.gtag = window.gtag || console.info;
} else {
  window.gtag = function() {};
}

let currentIdx = 1;
const main = document.querySelector('body');
const invertBtn = document.querySelector('i.fas.fa-palette.invert');
invertBtn.onclick = () => {
  const currentClass = config.palettes[currentIdx++ % config.palettes.length];
  main.classList = currentClass === 'color' ? '' : currentClass;
  window.gtag('event', 'invert_click', { event_category: 'click', event_label: 'ui', color: currentClass });
};

Array.from(document.querySelectorAll('a')).forEach(
  el =>
    (el.onclick = ({ target }) => {
      window.gtag('event', 'a_click', { event_category: 'click', event_label: 'links', href: target.href });
    })
);
