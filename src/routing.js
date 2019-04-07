import { handleSignOut, handleSignIn, updateSignInStatus } from './authorizeGSheet';
import initUploader from './uploader';
import createSpreadsheet from './createSpreadsheet';
import processZip from './processZip';

const status = document.querySelector('.box__status');
const form = document.querySelector('form');
const icon = document.querySelector('.fa-2x i');

const openFilePicker = () => document.querySelector('input[type="file"]').click();

const restart = e => {
  e && e.preventDefault();
  handleSignOut();
  const form = document.querySelector('form');
  form.classList.remove('is-error', 'is-success');
  router();
};

const copyStringToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style = { position: 'absolute', left: '-9999px' };
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const setProcessing = (msg = 'loading..') => {
  form.classList.remove('is-success', 'is-error');
  form.classList.toggle('is-processing');
  status.innerHTML = msg;
  icon.className = 'fas fa-circle-notch fa-spin';
  form.onclick = undefined;
};

const init = () => {
  status.innerHTML = '<span>Go to <a href="https://www.linkedin.com/psettings/member-data" target="_blank">LinkedIn export page</a></span>';
  icon.className = 'fab fa-linkedin';
  form.onclick = () => router(1);
};

const wait = () => {
  status.innerHTML = '<p>Export <strong>the works</strong></p><p>Wait for e-mail with first part of archive to arrive</p>';
  icon.className = 'fas fa-hourglass-start';
  form.onclick = () => router(2);
};

const checkAuth = () => {
  if (form.classList.contains('is-authorized')) {
    router(3);
  } else {
    status.innerHTML = '<strong>Please authorize with Google sheets</strong>';
    icon.className = 'fas fa-user-lock';
    form.onclick = () =>
      handleSignIn()
        .then(() => router(3))
        .catch(setError);
  }
};

const uploadFile = () => {
  form.onclick = openFilePicker;
  initUploader(file => {
    if (!updateSignInStatus()) return router(2);
    setProcessing(`<strong>"${file.name}"</strong> is processing`);
    processZip(file)
      .then(createSpreadsheet)
      .then(res => router(4, res))
      .catch(setError);
  });
  status.innerHTML = '<span><strong>Pick the archive "zip" file</strong> or drag it here.</span>';
  icon.className = 'fas fa-file-import';
};

const showSuccess = result => {
  const { spreadsheetUrl, spreadsheetId, properties } = result;
  const p1 = document.createElement('p');
  p1.innerHTML = `Spreadsheet <strong>"${properties.title}"</strong> successfully created`;
  const p2 = document.createElement('p');
  p2.innerHTML = `Open <a href="${spreadsheetUrl}" target="_blank">"${spreadsheetId}"</a> and <a href="https://support.google.com/docs/answer/183965" target="_blank">make it public</a>`;
  form.classList.remove('is-error', 'is-processing');
  form.classList.add('is-success');
  status.innerHTML = '';
  status.append(p1, p2);
  icon.className = 'fas fa-check-circle';
  form.onclick = () => {
    router(5, { result });
    copyStringToClipboard(spreadsheetId);
  };
};

const deploy = result => {
  const { spreadsheetId } = result;
  const p1 = document.createElement('p');
  p1.innerHTML = `Use Netlify deploy function to deploy website`;
  const a = document.createElement('a');
  a.href = 'https://app.netlify.com/start/deploy?repository=https://github.com/netlify/netlify-statuskit';
  a.innerHTML = '<img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>';
  a.target = '_blank';
  const p2 = document.createElement('p');
  p2.innerHTML = `Add spreadsheet ID <strong>"${spreadsheetId}"</strong> (copied to clipboard), hit deploy and wait for initial build to finish`;
  status.innerHTML = '';
  status.append(p1, a, p2);
  icon.className = 'fas fa-upload';
  form.onclick = () => {
    router(6);
    copyStringToClipboard(spreadsheetId);
  };
};

const signOut = () => {
  const a = document.createElement('a');
  a.href = '#';
  a.innerHTML = 'Sign out';
  a.role = 'button';
  a.onclick = handleSignOut;
  status.innerHTML = '';
  status.append(a);
  icon.className = 'fas fa-sign-out-alt';
  form.onclick = restart;
};

export const setError = err => {
  form.classList.remove('is-success', 'is-processing');
  form.classList.add('is-error');
  console.error(err);
  status.innerHTML = `<p>Following error occured:</p><strong>${
    err.message || typeof err === 'string' ? err : JSON.stringify(err)
  }</strong><p>Please restart</p>`;
  icon.className = 'fas fa-bomb';
  form.onclick = restart;
};

const router = (i = 0, res) => {
  switch (i) {
    case 0:
      init();
      break;
    case 1:
      wait();
      break;
    case 2:
      checkAuth();
      break;
    case 3:
      uploadFile();
      break;
    case 4:
      showSuccess(res.result);
      break;
    case 5:
      deploy(res.result);
      break;
    case 6:
      signOut();
      break;
    default:
      setProcessing();
      break;
  }
};

export default router;
