(() => {
  'use strict';

  const form = document.getElementById('adminLoginForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const rememberMe = document.getElementById('rememberMe');
  const toggleButton = document.getElementById('togglePasswordBtn');
  const storageKey = 'apex-ums-remembered-username';

  // Storage may be disabled, including when opening static files locally.
  try {
    const rememberedUsername = localStorage.getItem(storageKey);
    if (rememberedUsername) username.value = rememberedUsername;
    rememberMe.checked = Boolean(rememberedUsername);
  } catch {
    rememberMe.checked = false;
  }

  toggleButton.addEventListener('click', () => {
    const showPassword = password.type === 'password';
    password.type = showPassword ? 'text' : 'password';
    toggleButton.setAttribute('aria-pressed', String(showPassword));
    toggleButton.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
  });

  username.addEventListener('input', () => username.setCustomValidity(''));

  rememberMe.addEventListener('change', () => {
    if (!rememberMe.checked) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Remembering a username is optional; unavailable storage must not block login.
      }
    }
  });

  document.getElementById('forgotPasswordLink').addEventListener('click', (event) => {
    event.preventDefault();
    window.alert('Please contact Campus IT Services (it-support@apex.edu or Ext. 4401) for password reset assistance.');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    username.value = username.value.trim();
    username.setCustomValidity(username.value ? '' : 'Enter your email or administrative ID.');
    if (!form.reportValidity()) return;

    try {
      if (rememberMe.checked) {
        localStorage.setItem(storageKey, username.value);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Continue in demo mode when browser storage is unavailable.
    }

    // This static demo does not authenticate users. Production login requires a server.
    window.location.assign('dashboard.html');
  });
})();
