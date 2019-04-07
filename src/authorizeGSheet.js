import { setError } from './routing';

/**
 * Sign in the user upon button click.
 */
export const handleSignIn = () => gapi.auth2.getAuthInstance().signIn();
/**
 * Sign out the user upon button click.
 */
export const handleSignOut = () => gapi.auth2.getAuthInstance().signOut();

/**
 * Check if gsheet is authorized
 * @returns {boolean}
 */
export const isAuthorized = () => gapi.auth2.getAuthInstance().isSignedIn.get();

/**
 * Called when the signed in status changes, to update the UI
 * appropriately. After a sign-in, the API is called.
 * @param {boolean} [isSignedIn=isAuthorized()]
 * @param {string} msg
 * @returns {boolean}
 */
export const updateSignInStatus = (isSignedIn = isAuthorized()) => {
  const form = document.querySelector('form');
  if (isSignedIn) {
    form.classList.add('is-authorized');
  } else {
    form.classList.remove('is-authorized');
  }
  return isSignedIn;
};

/**
 * Initializes the API client library and sets up sign-in state
 * listeners.
 */
const initClient = () => {
  // Array of API discovery doc URLs for APIs used by the quickstart
  const discoveryDocs = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const scope = 'https://www.googleapis.com/auth/spreadsheets';

  return gapi.client
    .init({
      discoveryDocs,
      scope,
      ...window.config.gapi,
    })
    .then(
      () => {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        // Handle the initial sign-in state.
        updateSignInStatus();
      },
      error => {
        throw error;
      }
    )
    .catch(setError);
};

export default () => {
  const script = document.createElement('script');
  script.onload = () => gapi.load('client:auth2', initClient);
  script.src = '//apis.google.com/js/api.js';
  document.body.appendChild(script);
};
