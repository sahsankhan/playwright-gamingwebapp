const TOKEN_KEY = 'arcade-token';
const USER_KEY = 'arcade-user';

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

function requireGuest() {
  if (getToken()) {
    window.location.href = '/lobby.html';
  }
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }
  return payload;
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message ?? '';
  }
}

function bindLogout(buttonId = 'logout-btn') {
  const button = document.getElementById(buttonId);
  if (!button) {
    return;
  }
  button.addEventListener('click', async () => {
    try {
      await api('/api/logout', { method: 'POST' });
    } catch {
      // Session may already be invalid.
    }
    clearSession();
    window.location.href = '/login.html';
  });
}

window.ArcadeAuth = {
  getToken,
  getUser,
  setSession,
  clearSession,
  requireGuest,
  requireAuth,
  api,
  showError,
  bindLogout,
};
