import { useEffect } from 'react';
import {
  isSessionExpired,
  logout,
  LOGOUT_REASON_SESSION_EXPIRED,
} from '../../services/auth';

// Mounted once at the app root. Proactively logs the user out at the moment
// their JWT expires so they don't sit on stale data — and re-checks when the
// tab regains focus (the most common "I left this open overnight" case).
const SessionExpiryWatcher = () => {
  useEffect(() => {
    const expiry = Number(localStorage.getItem('tokenExpiry'));
    if (!Number.isFinite(expiry) || expiry <= 0) {
      return undefined; // Not logged in — nothing to watch.
    }

    if (isSessionExpired()) {
      logout({ reason: LOGOUT_REASON_SESSION_EXPIRED });
      return undefined;
    }

    const msUntilExpiry = expiry - Date.now();
    const expiryTimer = setTimeout(() => {
      logout({ reason: LOGOUT_REASON_SESSION_EXPIRED });
    }, msUntilExpiry);

    const handleFocus = () => {
      if (isSessionExpired()) {
        logout({ reason: LOGOUT_REASON_SESSION_EXPIRED });
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(expiryTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
};

export default SessionExpiryWatcher;
