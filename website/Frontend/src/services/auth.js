// Centralized auth helpers. Anything that needs to log the user out (manual
// sign-out, axios 401 interceptor, the session-expiry watcher, etc.) goes
// through `logout()` so we always clear the same set of keys, end up on the
// same page, and surface a consistent reason on the login screen.

const AUTH_KEYS = [
  'token',
  'tokenExpiry',
  'userRole',
  'userId',
  'username',
  'userType',
];

// Reasons we route through sessionStorage so the login page can render an
// appropriate banner. sessionStorage is used (not localStorage) so the message
// disappears when the user closes the tab — it's a one-shot notice, not state.
export const LOGOUT_REASON_KEY = 'logoutReason';
export const LOGOUT_REASON_SESSION_EXPIRED = 'session_expired';

export function logout({ reason = null, redirectTo = '/login' } = {}) {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));

  if (reason) {
    sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
  }

  // Hard navigation rather than React Router. We want a fresh app state with
  // no stale React/Context data and no in-flight requests still running.
  window.location.href = redirectTo;
}

export function isSessionExpired() {
  const expiry = Number(localStorage.getItem('tokenExpiry'));
  return Number.isFinite(expiry) && expiry > 0 && Date.now() >= expiry;
}

export function consumeLogoutReason() {
  const reason = sessionStorage.getItem(LOGOUT_REASON_KEY);
  if (reason) {
    sessionStorage.removeItem(LOGOUT_REASON_KEY);
  }
  return reason;
}
