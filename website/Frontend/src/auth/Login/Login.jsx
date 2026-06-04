import { useEffect, useState } from 'react';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  consumeLogoutReason,
  LOGOUT_REASON_SESSION_EXPIRED,
} from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/* ── Inline SVG illustration — learning tree ── */
function TreeIllustration() {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="login-tree-svg"
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="200" cy="450" rx="68" ry="10" fill="rgba(0,0,0,0.22)" />

      {/* Trunk */}
      <rect x="182" y="308" width="36" height="136" rx="13" fill="rgba(185,135,72,0.4)" />
      <rect x="188" y="314" width="10" height="124" rx="5" fill="rgba(255,210,120,0.18)" />

      {/* Root flares */}
      <path d="M188 430 Q167 436 146 426" stroke="rgba(185,135,72,0.3)" strokeWidth="9" strokeLinecap="round" />
      <path d="M212 430 Q233 436 254 426" stroke="rgba(185,135,72,0.3)" strokeWidth="9" strokeLinecap="round" />

      {/* ── Canopy: three-circle cloud-puff ── */}
      {/* Deep shadow backing */}
      <circle cx="200" cy="210" r="138" fill="rgba(18,43,34,0.55)" />
      {/* Layer 1 — darkest */}
      <circle cx="157" cy="232" r="98"  fill="#163D2A" />
      <circle cx="243" cy="232" r="98"  fill="#163D2A" />
      <circle cx="200" cy="176" r="110" fill="#163D2A" />
      {/* Layer 2 */}
      <circle cx="158" cy="226" r="88"  fill="#1B4332" />
      <circle cx="242" cy="226" r="88"  fill="#1B4332" />
      <circle cx="200" cy="172" r="100" fill="#1B4332" />
      {/* Layer 3 */}
      <circle cx="160" cy="220" r="76"  fill="#2D6A4F" />
      <circle cx="240" cy="220" r="76"  fill="#2D6A4F" />
      <circle cx="200" cy="168" r="88"  fill="#2D6A4F" />
      {/* Layer 4 */}
      <circle cx="162" cy="215" r="64"  fill="#40916C" />
      <circle cx="238" cy="215" r="64"  fill="#40916C" />
      <circle cx="200" cy="163" r="76"  fill="#40916C" />
      {/* Layer 5 — bright */}
      <circle cx="164" cy="210" r="52"  fill="#52B788" />
      <circle cx="236" cy="210" r="52"  fill="#52B788" />
      <circle cx="200" cy="158" r="64"  fill="#52B788" />
      {/* Top highlight */}
      <circle cx="200" cy="149" r="50"  fill="#74C69D" />
      <circle cx="200" cy="141" r="33"  fill="#95D5B2" />
      {/* Shine spot */}
      <ellipse cx="175" cy="124" rx="21" ry="15" fill="rgba(255,255,255,0.09)" />

      {/* ── Icon badges ── */}

      {/* BOOK — left */}
      <circle cx="96"  cy="234" r="27" fill="white" opacity="0.93" />
      <rect x="83" y="222" width="26" height="20" rx="3" fill="#2D6A4F" />
      <rect x="83" y="222" width="12" height="20" rx="2" fill="#52B788" />
      <line x1="95" y1="222" x2="95" y2="242" stroke="white" strokeWidth="1.5" />
      <line x1="85" y1="227" x2="93" y2="227" stroke="rgba(255,255,255,0.65)" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="85" y1="231" x2="93" y2="231" stroke="rgba(255,255,255,0.65)" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="85" y1="235" x2="93" y2="235" stroke="rgba(255,255,255,0.65)" strokeWidth="1.1" strokeLinecap="round" />

      {/* LIGHTBULB — upper right */}
      <circle cx="298" cy="156" r="27" fill="#FFD60A" opacity="0.95" />
      <circle cx="298" cy="149" r="9"  fill="white" />
      <rect   x="294" y="157" width="8" height="3" rx="1.5" fill="white" opacity="0.85" />
      <rect   x="295" y="160" width="6" height="2" rx="1"   fill="white" opacity="0.65" />
      <line x1="298" y1="136" x2="298" y2="133" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="307" y1="139" x2="309" y2="137" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="289" y1="139" x2="287" y2="137" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="313" y1="149" x2="316" y2="149" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="283" y1="149" x2="280" y2="149" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* GRADUATION CAP — upper left */}
      <circle cx="114" cy="166" r="27" fill="#90CAF9" opacity="0.95" />
      <polygon points="114,153 97,162 131,162" fill="white" />
      <rect x="99" y="170" width="26" height="12" rx="3" fill="white" />
      <line x1="129" y1="162" x2="129" y2="170" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="129" cy="172" r="2.5" fill="white" />

      {/* CODE </> — right */}
      <circle cx="304" cy="231" r="27" fill="#CE93D8" opacity="0.95" />
      <text x="304" y="231" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill="white" fontFamily="monospace">{'</>'}</text>

      {/* ATOM — lower left of canopy */}
      <circle cx="135" cy="274" r="22" fill="rgba(255,255,255,0.15)" />
      <circle cx="135" cy="274" r="4.5" fill="rgba(255,255,255,0.88)" />
      <ellipse cx="135" cy="274" rx="17" ry="6.5" stroke="rgba(255,255,255,0.72)" strokeWidth="1.4" fill="none" />
      <ellipse cx="135" cy="274" rx="17" ry="6.5" stroke="rgba(255,255,255,0.72)" strokeWidth="1.4" fill="none" transform="rotate(60 135 274)" />
      <ellipse cx="135" cy="274" rx="17" ry="6.5" stroke="rgba(255,255,255,0.72)" strokeWidth="1.4" fill="none" transform="rotate(120 135 274)" />

      {/* MATH ∑ — lower right of canopy */}
      <circle cx="265" cy="274" r="22" fill="rgba(255,255,255,0.15)" />
      <text x="265" y="274" textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="700" fill="rgba(255,255,255,0.88)">∑</text>

      {/* ── Star at top ── */}
      <circle cx="200" cy="80" r="14" fill="rgba(255,255,255,0.15)" />
      <circle cx="200" cy="80" r="9"  fill="white" opacity="0.95" />
      <circle cx="200" cy="80" r="4"  fill="#52B788" />
      <line x1="200" y1="66" x2="200" y2="60" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="200" y1="94" x2="200" y2="100" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="186" y1="80" x2="180" y2="80" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="214" y1="80" x2="220" y2="80" stroke="white" strokeWidth="2"   strokeLinecap="round" opacity="0.7" />
      <line x1="191" y1="71" x2="186" y2="66" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="209" y1="71" x2="214" y2="66" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="191" y1="89" x2="186" y2="94" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="209" y1="89" x2="214" y2="94" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* ── Floating sparkle dots ── */}
      <circle cx="54"  cy="205" r="5"   fill="white" opacity="0.42" />
      <circle cx="54"  cy="205" r="2.5" fill="white" opacity="0.68" />
      <circle cx="350" cy="180" r="4"   fill="white" opacity="0.36" />
      <circle cx="350" cy="180" r="2"   fill="white" opacity="0.62" />
      <circle cx="40"  cy="305" r="3.5" fill="white" opacity="0.28" />
      <circle cx="362" cy="282" r="4.5" fill="white" opacity="0.32" />
      <circle cx="362" cy="282" r="2"   fill="white" opacity="0.58" />
      <circle cx="80"  cy="142" r="3"   fill="white" opacity="0.36" />
      <circle cx="322" cy="134" r="3"   fill="white" opacity="0.33" />

      {/* Cross sparkles */}
      <g opacity="0.46">
        <line x1="342" y1="332" x2="342" y2="342" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="337" y1="337" x2="347" y2="337" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.38">
        <line x1="58"  y1="264" x2="58"  y2="272" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="54"  y1="268" x2="62"  y2="268" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.35">
        <line x1="152" y1="56"  x2="152" y2="64"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="148" y1="60"  x2="156" y2="60"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.38">
        <line x1="248" y1="52"  x2="248" y2="60"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="244" y1="56"  x2="252" y2="56"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
