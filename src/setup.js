import initRouting from './routing';
import initGSheet from './authorizeGSheet';

/**
 * Remove class if javascript is available
 */
document.documentElement.classList.remove('no-js');

const modal = document.querySelector('.modal');

document.querySelector('i.fas.fa-info-circle').addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  modal.classList.add('active');
});

const closeModal = e => {
  e.preventDefault();
  modal.classList.remove('active');
};

document.querySelector('.modal-overlay').addEventListener('click', closeModal);
document.querySelector('.modal i.fas.fa-times').addEventListener('click', closeModal);

initGSheet();
initRouting();
