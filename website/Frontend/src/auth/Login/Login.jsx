import { useEffect, useState } from 'react';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  consumeLogoutReason,
  LOGOUT_REASON_SESSION_EXPIRED,
} from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/* ── Inline SVG illustration — educational tree ── */
function TreeIllustration() {
  return (
    <svg
      viewBox="0 0 400 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="login-tree-svg"
      aria-hidden="true"
    >
      {/* Soft glow behind tree */}
      <ellipse cx="200" cy="280" rx="145" ry="200" fill="rgba(82,183,136,0.08)" />

      {/* Ground shadow */}
      <ellipse cx="200" cy="448" rx="92" ry="14" fill="rgba(0,0,0,0.2)" />

      {/* Root flares */}
      <path d="M182 430 C172 428 152 422 136 416" stroke="rgba(255,255,255,0.18)" strokeWidth="9" strokeLinecap="round" />
      <path d="M218 430 C228 428 248 422 264 416" stroke="rgba(255,255,255,0.18)" strokeWidth="9" strokeLinecap="round" />

      {/* Trunk */}
      <path
        d="M188 440 C186 400 183 365 182 340 C181 325 180 315 180 308 C180 315 179 325 178 340 C177 365 174 400 172 440 Z"
        fill="rgba(255,255,255,0.28)"
      />
      <rect x="176" y="308" width="28" height="134" rx="10" fill="rgba(255,255,255,0.22)" />

      {/* Foliage — layer 1 (base, widest, darkest) */}
      <ellipse cx="200" cy="330" rx="118" ry="74" fill="#163D2A" />
      {/* Foliage — layer 2 */}
      <ellipse cx="200" cy="278" rx="104" ry="70" fill="#1B4332" />
      {/* Foliage — layer 3 */}
      <ellipse cx="200" cy="232" rx="88" ry="64" fill="#2D6A4F" />
      {/* Foliage — layer 4 */}
      <ellipse cx="200" cy="190" rx="70" ry="54" fill="#40916C" />
      {/* Foliage — layer 5 */}
      <ellipse cx="200" cy="155" rx="54" ry="44" fill="#52B788" />
      {/* Foliage — layer 6 (tip, lightest) */}
      <ellipse cx="200" cy="126" rx="36" ry="34" fill="#74C69D" />
      {/* Very tip */}
      <ellipse cx="200" cy="104" rx="20" ry="22" fill="#95D5B2" />

      {/* ── Book decorations in foliage ── */}
      {/* Book 1 — mid left */}
      <g opacity="0.55">
        <rect x="128" y="268" width="22" height="16" rx="2" fill="white" />
        <rect x="128" y="268" width="22" height="16" rx="2" stroke="rgba(45,106,79,0.4)" strokeWidth="0.5" />
        <line x1="139" y1="268" x2="139" y2="284" stroke="rgba(45,106,79,0.6)" strokeWidth="1.5" />
        {/* Pages hint */}
        <line x1="131" y1="272" x2="138" y2="272" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
        <line x1="131" y1="275" x2="138" y2="275" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
        <line x1="141" y1="272" x2="148" y2="272" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
      </g>

      {/* Book 2 — mid right */}
      <g opacity="0.5">
        <rect x="248" y="248" width="20" height="15" rx="2" fill="white" />
        <line x1="258" y1="248" x2="258" y2="263" stroke="rgba(45,106,79,0.6)" strokeWidth="1.5" />
        <line x1="251" y1="252" x2="257" y2="252" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
        <line x1="251" y1="255" x2="257" y2="255" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
        <line x1="259" y1="252" x2="266" y2="252" stroke="rgba(45,106,79,0.35)" strokeWidth="0.8" />
      </g>

      {/* Book 3 — upper */}
      <g opacity="0.45">
        <rect x="166" y="196" width="18" height="13" rx="2" fill="white" />
        <line x1="175" y1="196" x2="175" y2="209" stroke="rgba(45,106,79,0.6)" strokeWidth="1.5" />
      </g>

      {/* Book 4 — upper right */}
      <g opacity="0.4">
        <rect x="216" y="188" width="16" height="12" rx="2" fill="white" />
        <line x1="224" y1="188" x2="224" y2="200" stroke="rgba(45,106,79,0.55)" strokeWidth="1.5" />
      </g>

      {/* ── Star / glow at very top ── */}
      <circle cx="200" cy="84" r="13" fill="rgba(255,255,255,0.15)" />
      <circle cx="200" cy="84" r="8" fill="white" opacity="0.92" />
      <circle cx="200" cy="84" r="4" fill="#52B788" />

      {/* Star rays */}
      <line x1="200" y1="71" x2="200" y2="65" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="200" y1="97" x2="200" y2="103" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="187" y1="84" x2="181" y2="84" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="213" y1="84" x2="219" y2="84" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="191" y1="75" x2="186" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="209" y1="75" x2="214" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="191" y1="93" x2="186" y2="98" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="209" y1="93" x2="214" y2="98" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* ── Floating sparkle dots ── */}
      <circle cx="58"  cy="210" r="5"   fill="white" opacity="0.45" />
      <circle cx="58"  cy="210" r="2.5" fill="white" opacity="0.7" />

      <circle cx="348" cy="185" r="4"   fill="white" opacity="0.38" />
      <circle cx="348" cy="185" r="2"   fill="white" opacity="0.65" />

      <circle cx="44"  cy="310" r="3.5" fill="white" opacity="0.32" />

      <circle cx="362" cy="290" r="4.5" fill="white" opacity="0.35" />
      <circle cx="362" cy="290" r="2"   fill="white" opacity="0.6" />

      <circle cx="88"  cy="148" r="3"   fill="white" opacity="0.38" />
      <circle cx="320" cy="138" r="3.5" fill="white" opacity="0.35" />

      <circle cx="72"  cy="385" r="2.5" fill="white" opacity="0.28" />
      <circle cx="336" cy="370" r="3"   fill="white" opacity="0.3" />

      <circle cx="116" cy="110" r="2"   fill="white" opacity="0.4" />
      <circle cx="290" cy="105" r="2.5" fill="white" opacity="0.38" />

      {/* Small cross sparkles */}
      <g opacity="0.5">
        <line x1="340" y1="340" x2="340" y2="350" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="335" y1="345" x2="345" y2="345" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.42">
        <line x1="62" y1="270" x2="62" y2="278" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="58" y1="274" x2="66" y2="274" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.38">
        <line x1="155" y1="64" x2="155" y2="72" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="151" y1="68" x2="159" y2="68" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.4">
        <line x1="248" y1="60" x2="248" y2="68" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="244" y1="64" x2="252" y2="64" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
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
          setError('Account not verified. A new verification code has been sent to your email. Redirecting…');
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
        <a href="/" className="login-brand" aria-label="Academathon home">
          <span className="login-brand-mark">at</span>
          <span className="login-brand-name">Academathon</span>
        </a>

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

      {/* ── Right: illustration panel ── */}
      <div className="login-visual-panel" aria-hidden="true">
        <div className="login-visual-inner">
          <TreeIllustration />
          <p className="login-visual-tagline">
            Growing minds,<br />one lesson at a time.
          </p>
          <div className="login-visual-stats">
            <span>200+ students</span>
            <span className="login-stat-dot">·</span>
            <span>18 subjects</span>
            <span className="login-stat-dot">·</span>
            <span>Since 2021</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
