document.addEventListener('DOMContentLoaded', () => {
  const config = window.ZM_FIREBASE_CONFIG;
  const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const configIsReady = config
    && requiredConfig.every(key => typeof config[key] === 'string' && config[key].trim().length > 0);

  const form = document.getElementById('authForm');
  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');
  const passwordField = document.getElementById('passwordField');
  const submitButton = document.getElementById('authSubmit');
  const toggleButton = document.getElementById('toggleAuthMode');
  const resetButton = document.getElementById('resetPassword');
  const status = document.getElementById('authStatus');
  const setupNotice = document.getElementById('firebaseSetupNotice');
  const accountPanel = document.getElementById('signedInAccount');
  const authActions = document.getElementById('authActions');
  const title = document.getElementById('authTitle');
  const intro = document.getElementById('authIntro');
  let auth;
  let createAccountMode = false;
  let isSubmitting = false;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.dataset.error = String(isError);
    status.hidden = !message;
  }

  function setAccount(user) {
    const isSignedIn = Boolean(user);
    accountPanel.hidden = !isSignedIn;
    form.hidden = isSignedIn;
    authActions.hidden = isSignedIn;
    if (!user) return;

    document.getElementById('accountEmail').textContent = `Signed in as ${user.email || 'your account'}.`;
    document.getElementById('accountId').textContent = `Account ID: ${user.uid}`;
    setStatus('You are signed in to your ZM Collective account.');
  }

  function setAuthMode(isCreateAccount) {
    createAccountMode = isCreateAccount;
    title.textContent = createAccountMode ? 'Create account' : 'Sign in';
    intro.textContent = createAccountMode
      ? 'Create an account with your email address and a password of at least 6 characters.'
      : 'Sign in to your account or create one to keep your details together.';
    submitButton.textContent = createAccountMode ? 'Create account' : 'Sign in';
    passwordInput.autocomplete = createAccountMode ? 'new-password' : 'current-password';
    toggleButton.textContent = createAccountMode ? 'Already have an account? Sign in' : 'Create an account';
    resetButton.hidden = createAccountMode;
    setStatus('');
  }

  function getAuthErrorMessage(error) {
    const messages = {
      'auth/email-already-in-use': 'An account already exists with this email. Sign in instead.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/user-disabled': 'This account has been disabled. Contact support for help.',
      'auth/user-not-found': 'No account was found for this email. Create an account first.',
      'auth/wrong-password': 'The email or password is incorrect.',
      'auth/weak-password': 'Choose a password with at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Wait a while and try again.',
      'auth/network-request-failed': 'Could not connect. Check your internet connection and try again.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this Firebase project.',
      'auth/unauthorized-domain': 'This site domain is not authorized in the Firebase project settings.'
    };
    return messages[error.code] || 'Sign-in could not be completed. Please try again.';
  }

  function loadFirebaseScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.gstatic.com/firebasejs/10.14.1/${path}`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load Firebase SDK file: ${path}`));
      document.head.appendChild(script);
    });
  }

  if (!configIsReady) {
    setupNotice.hidden = false;
    form.querySelectorAll('input, button').forEach(control => { control.disabled = true; });
    toggleButton.disabled = true;
    resetButton.disabled = true;
    return;
  }

  Promise.resolve()
    .then(() => loadFirebaseScript('firebase-app-compat.js'))
    .then(() => loadFirebaseScript('firebase-auth-compat.js'))
    .then(() => {
      if (!window.firebase) {
        throw new Error('Firebase SDK loaded without the expected Firebase global.');
      }
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      auth = window.firebase.auth();
      auth.onAuthStateChanged(setAccount, error => {
        console.error('Firebase could not read the sign-in state.', error);
        setStatus('Could not check your sign-in status. Please reload and try again.', true);
      });
    })
    .catch(error => {
      console.error('Firebase sign-in could not be initialized.', error);
      setStatus('Sign-in could not be initialized. Check the Firebase setup and your connection.', true);
    });

  toggleButton.addEventListener('click', () => setAuthMode(!createAccountMode));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!auth || isSubmitting) {
      setStatus('Firebase sign-in is still loading. Try again in a moment.', true);
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    setStatus(createAccountMode ? 'Creating your account…' : 'Signing you in…');
    const operation = createAccountMode
      ? auth.createUserWithEmailAndPassword(emailInput.value.trim(), passwordInput.value)
      : auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value);

    operation
      .then(() => {
        passwordInput.value = '';
        setStatus(createAccountMode ? 'Your account has been created.' : 'You are signed in.');
      })
      .catch(error => {
        console.error('Firebase authentication request failed.', error);
        setStatus(getAuthErrorMessage(error), true);
      })
      .finally(() => {
        isSubmitting = false;
        submitButton.disabled = false;
      });
  });

  resetButton.addEventListener('click', () => {
    if (!auth) {
      setStatus('Firebase sign-in is still loading. Try again in a moment.', true);
      return;
    }
    const email = emailInput.value.trim();
    if (!email) {
      emailInput.focus();
      setStatus('Enter your email address first, then choose “Forgot password?”.', true);
      return;
    }

    auth.sendPasswordResetEmail(email)
      .then(() => setStatus('If an account exists for that email, a password reset link has been sent.'))
      .catch(error => {
        console.error('Firebase password reset request failed.', error);
        setStatus(getAuthErrorMessage(error), true);
      });
  });

  document.getElementById('signOut').addEventListener('click', () => {
    if (!auth) return;
    auth.signOut()
      .then(() => setStatus('You have been signed out.'))
      .catch(error => {
        console.error('Firebase sign-out failed.', error);
        setStatus('Sign-out could not be completed. Please try again.', true);
      });
  });

  setAuthMode(false);
});
