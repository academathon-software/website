import { useEffect, useState } from 'react';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  consumeLogoutReason,
  LOGOUT_REASON_SESSION_EXPIRED,
} from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/* ── Inline SVG — clean educational tree ── */
function TreeIllustration() {
  return (
    <svg
      viewBox="0 0 320 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="login-tree-svg"
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="160" cy="396" rx="72" ry="10" fill="rgba(0,0,0,0.18)" />

      {/* Trunk */}
      <rect x="148" y="288" width="24" height="112" rx="10" fill="rgba(255,255,255,0.28)" />

      {/* Foliage — 4 layers, dark at base → light at tip */}
      <circle cx="160" cy="278" r="100" fill="#163529" />
      <circle cx="160" cy="215" r="78"  fill="#2D6A4F" />
      <circle cx="160" cy="160" r="58"  fill="#40916C" />
      <circle cx="160" cy="113" r="40"  fill="#52B788" />
      <circle cx="160" cy="77"  r="24"  fill="#74C69D" />

      {/* ── Open books in the foliage ── */}

      {/* Book A — bottom left of canopy */}
      <g opacity="0.6">
        <rect x="88"  y="252" width="21" height="14" rx="1.5" fill="white" />
        <rect x="109" y="252" width="21" height="14" rx="1.5" fill="rgba(255,255,255,0.8)" />
        <rect x="107" y="251" width="4"  height="16" rx="1.5" fill="rgba(22,53,41,0.85)" />
        {/* page lines */}
        <line x1="92"  y1="257" x2="106" y2="257" stroke="rgba(22,53,41,0.3)" strokeWidth="1" />
        <line x1="92"  y1="261" x2="106" y2="261" stroke="rgba(22,53,41,0.3)" strokeWidth="1" />
        <line x1="112" y1="257" x2="126" y2="257" stroke="rgba(22,53,41,0.3)" strokeWidth="1" />
        <line x1="112" y1="261" x2="126" y2="261" stroke="rgba(22,53,41,0.3)" strokeWidth="1" />
      </g>

      {/* Book B — right of middle foliage */}
      <g opacity="0.52">
        <rect x="199" y="218" width="19" height="13" rx="1.5" fill="white" />
        <rect x="218" y="218" width="19" height="13" rx="1.5" fill="rgba(255,255,255,0.8)" />
        <rect x="216" y="217" width="4"  height="15" rx="1.5" fill="rgba(22,53,41,0.85)" />
        <line x1="203" y1="222" x2="215" y2="222" stroke="rgba(22,53,41,0.3)" strokeWidth="0.9" />
        <line x1="203" y1="226" x2="215" y2="226" stroke="rgba(22,53,41,0.3)" strokeWidth="0.9" />
        <line x1="220" y1="222" x2="232" y2="222" stroke="rgba(22,53,41,0.3)" strokeWidth="0.9" />
      </g>

      {/* Book C — upper foliage */}
      <g opacity="0.45">
        <rect x="133" y="162" width="16" height="11" rx="1.5" fill="white" />
        <rect x="149" y="162" width="16" height="11" rx="1.5" fill="rgba(255,255,255,0.8)" />
        <rect x="147" y="161" width="4"  height="13" rx="1.5" fill="rgba(45,106,79,0.8)" />
      </g>

      {/* ── Star / glowing tip ── */}
      <circle cx="160" cy="55" r="14" fill="rgba(255,255,255,0.12)" />
      <circle cx="160" cy="55" r="9"  fill="white" opacity="0.95" />
      <circle cx="160" cy="55" r="4.5" fill="#52B788" />
      {/* rays */}
      <line x1="160" y1="40" x2="160" y2="34" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="160" y1="70" x2="160" y2="76" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="145" y1="55" x2="139" y2="55" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="175" y1="55" x2="181" y2="55" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="150" y1="45" x2="145" y2="40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="170" y1="45" x2="175" y2="40" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="150" y1="65" x2="145" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="170" y1="65" x2="175" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* ── Floating sparkle dots (6, minimal) ── */}
      <circle cx="44"  cy="195" r="5"   fill="white" opacity="0.42" />
      <circle cx="44"  cy="195" r="2.5" fill="white" opacity="0.75" />

      <circle cx="284" cy="172" r="4"   fill="white" opacity="0.36" />
      <circle cx="284" cy="172" r="2"   fill="white" opacity="0.65" />

      <circle cx="36"  cy="292" r="3.5" fill="white" opacity="0.3"  />

      <circle cx="292" cy="268" r="4.5" fill="white" opacity="0.32" />
      <circle cx="292" cy="268" r="2"   fill="white" opacity="0.6"  />

      <circle cx="76"  cy="118" r="3"   fill="white" opacity="0.36" />
      <circle cx="252" cy="106" r="3.5" fill="white" opacity="0.33" />
    </svg>
  );
}

/* ── Main component ── */
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const reason = consumeLogoutReason();
    if (reason === LOGOUT_REASON_SESSION_EXPIRED) {
      setNotice('Your session expired. Please log in again.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', Date.now() + Number(data.expiresIn));
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);

        if (data.role === 'ADMIN') {
          window.location.href = '/admin-dashboard';
        } else if (data.role === 'TUTOR') {
          window.location.href = '/tutor-dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Incorrect email or password';

        if (errorMessage.startsWith('VERIFICATION_REQUIRED:')) {
          localStorage.setItem('pendingVerificationEmail', email);
          setError('Account not verified. A new code has been sent to your email. Redirecting…');
          setTimeout(() => { window.location.href = '/verify'; }, 2000);
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-page">

      {/* ── Left: form panel ── */}
      <div className="login-form-panel">
        {/* Logo — always top-left */}
        <a href="/" className="login-brand" aria-label="Academathon home">
          <span className="login-brand-mark">at</span>
          <span className="login-brand-name">Academathon</span>
        </a>

        {/* Form — vertically centered in remaining space */}
        <div className="login-form-center">
          <div className="login-form-wrap">
            <p className="login-eyebrow">Welcome back</p>
            <h1 className="login-heading">
              Sign in to <em>your account.</em>
            </h1>
            <p className="login-subheading">
              Don't have an account?{' '}
              <a href="/signup" className="login-inline-link">Sign up free</a>
            </p>

            {notice && (
              <div className="login-notice" role="status">
                <p>{notice}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form" noValidate>
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label className="login-label" htmlFor="login-password">Password</label>
                  <a href="/forgot-password" className="login-forgot">Forgot password?</a>
                </div>
                <div className="login-password-wrap">
                  <input
                    id="login-password"
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <p>{error}</p>
                </div>
              )}

              <button type="submit" className="login-submit">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Right: illustration panel ── */}
      <div className="login-visual-panel" aria-hidden="true">
        <div className="login-visual-inner">
          <TreeIllustration />
          <p className="login-visual-tagline">
            Growing minds,<br />one lesson at a time.
          </p>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
