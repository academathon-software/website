import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomeV2.css';
import Footer from '../Footer/Footer';
import VoiceAgent from '../VoiceAgent/VoiceAgent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookOpen,
  faCalendarCheck,
  faGraduationCap,
  faStar,
  faCircleCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import waterlooLogo from '../../assets/waterloo.png';
import mcgillLogo from '../../assets/mcgill.png';
import mcmasterLogo from '../../assets/mcmaster.png';
import westernLogo from '../../assets/western.png';
import torontoLogo from '../../assets/toronto.png';

const tutors = [
  { initials: 'SA', color: '#2D6A4F', name: 'Sarah A.', subject: 'Mathematics · Grades 9–12', rating: '4.9', uni: 'University of Waterloo',  price: '$30 CAD / session' },
  { initials: 'MK', color: '#40916C', name: 'Marcus K.', subject: 'Physics · Grades 11–12',   rating: '4.8', uni: 'University of Toronto',   price: '$35 CAD / session' },
  { initials: 'PS', color: '#1B6CA8', name: 'Priya S.', subject: 'Chemistry · Grades 10–12',  rating: '5.0', uni: 'McGill University',        price: '$35 CAD / session' },
  { initials: 'JL', color: '#6B5B95', name: 'James L.', subject: 'English · Grades 1–8',      rating: '4.7', uni: 'McMaster University',      price: '$25 CAD / session' },
];

const uniLogos = [
  { src: waterlooLogo, alt: 'University of Waterloo' },
  { src: mcgillLogo,   alt: 'McGill University' },
  { src: mcmasterLogo, alt: 'McMaster University' },
  { src: westernLogo,  alt: 'Western University' },
  { src: torontoLogo,  alt: 'University of Toronto' },
];

function HomeV2() {
  const statsRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  // Tutor card shuffle — back card slides to front
  // Single offset drives all 4 cards — no state swap, no phase machine, pure CSS transitions
  const [cardOffset, setCardOffset] = useState(0);
  const N = tutors.length;

  useEffect(() => {
    const id = setInterval(() => setCardOffset(o => (o + 1) % N), 4800);
    return () => clearInterval(id);
  }, [N]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = statsRef.current;
    const canvasWrap = canvasWrapRef.current;
    if (!canvas || !section || !canvasWrap) return;

    const ctx = canvas.getContext('2d');
    let w, h, raf;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvasWrap.offsetWidth;
      h = canvasWrap.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // 200 lines evenly distributed in the upper semicircle (π → 2π)
    const LINE_COUNT = 200;
    const lines = Array.from({ length: LINE_COUNT }, (_, i) => ({
      baseAngle: Math.PI + (i / (LINE_COUNT - 1)) * Math.PI,
      speed:    0.07 + Math.random() * 0.12,
      phase:    Math.random() * Math.PI * 2,
      baseLen:  0.28 + Math.random() * 0.66,
      waveAmp:  0.009 + Math.random() * 0.016,
    }));

    // Smooth cursor state — lerped for fluid feel
    let curX = 0, curY = 0;   // current lerped position (canvas px)
    let tgtX = 0, tgtY = 0;   // target (set by mousemove)
    let active = false;        // whether cursor is over the section

    let t = 0;

    const draw = () => {
      // Lerp cursor smoothly
      const lerpK = active ? 0.10 : 0.05;
      curX += (tgtX - curX) * lerpK;
      curY += (tgtY - curY) * lerpK;

      ctx.clearRect(0, 0, w, h);

      // Focal point: pinned just below canvas bottom → perfectly flat base
      const cx = w * 0.5;
      const cy = h + 6;

      const R = Math.max(w, h) * 1.08;

      // Angle from focal point to cursor (used for angular attraction)
      const cursorAngle = Math.atan2(curY - cy, curX - cx);

      for (const l of lines) {
        // Idle sway
        const sway = Math.sin(t * l.speed + l.phase) * l.waveAmp;
        const baseA = l.baseAngle + sway;
        const len   = R * l.baseLen * (0.88 + 0.12 * Math.cos(t * l.speed * 0.45 + l.phase));

        let finalA = baseA;

        if (active) {
          // ── Angular attraction (affects EVERY line) ──────────────────────
          // Each line's angle is pulled toward the cursor's angle from the focal point.
          // sigma=1.3 rad (~75°) means even lines 90° away still react meaningfully.
          let da = cursorAngle - baseA;
          if (da >  Math.PI) da -= 2 * Math.PI;
          if (da < -Math.PI) da += 2 * Math.PI;

          const sigma = 1.3;
          const angInfluence = Math.exp(-(da * da) / (2 * sigma * sigma));
          finalA = baseA + da * angInfluence * 0.42;
        }

        const tipX = cx + Math.cos(finalA) * len;
        const tipY = cy + Math.sin(finalA) * len;

        // ── Spatial pull (lines near cursor tip get an extra bend) ──────────
        let drawTipX = tipX;
        let drawTipY = tipY;
        if (active) {
          const dx   = curX - tipX;
          const dy   = curY - tipY;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist > 1) {
            const s = Math.pow(1 - dist / 200, 2) * 75;
            drawTipX += (dx / dist) * s;
            drawTipY += (dy / dist) * s;
          }
        }

        // Line gradient: bright at focal, holds luminosity, fades at tip
        const g = ctx.createLinearGradient(cx, cy, drawTipX, drawTipY);
        g.addColorStop(0,    'rgba(255,255,255,0.78)');
        g.addColorStop(0.40, 'rgba(255,255,255,0.42)');
        g.addColorStop(0.78, 'rgba(255,255,255,0.14)');
        g.addColorStop(1,    'rgba(255,255,255,0.00)');

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(drawTipX, drawTipY);
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Dot at tip — gently pulses
        const dotA = 0.22 + 0.16 * Math.abs(Math.cos(t * l.speed * 0.3 + l.phase));
        ctx.beginPath();
        ctx.arc(drawTipX, drawTipY, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${dotA})`;
        ctx.fill();
      }

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e) => {
      const cr = canvasWrap.getBoundingClientRect();
      tgtX = e.clientX - cr.left;
      tgtY = e.clientY - cr.top;
      if (!active) {
        // Snap cursor to position instantly on first enter (no lag on entry)
        curX = tgtX; curY = tgtY;
        active = true;
      }
    };

    const onLeave = () => {
      // Ease back toward center — keep active briefly so lines relax smoothly
      tgtX = w * 0.5;
      tgtY = h * 0.4;
      setTimeout(() => { active = false; }, 500);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvasWrap);
    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="home-v2">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hv2-hero">
        <div className="hv2-hero-inner">

          <div className="hv2-hero-text">
            <p className="hv2-eyebrow">Academathon Inc.</p>
            <h1 className="hv2-headline">
              Every student deserves<br />
              <em>a great tutor.</em>
            </h1>
            <p className="hv2-subhead">
              One-on-one online tutoring for Grades 1–12 with vetted university
              students. Flexible scheduling, clear CAD pricing, real results.
            </p>
            <div className="hv2-ctas">
              <Link to="/signup" className="hv2-cta-primary">
                Get started
              </Link>
              <Link to="/pricing" className="hv2-cta-ghost">
                See pricing
              </Link>
            </div>
            <div className="hv2-trust-bar">
              <span>
                <FontAwesomeIcon icon={faCircleCheck} />
                200+ students served
              </span>
              <span className="hv2-trust-dot">·</span>
              <span>From $25 CAD / session</span>
              <span className="hv2-trust-dot">·</span>
              <span>All subjects, Grades 1–12</span>
            </div>
          </div>

          {/* Tutor card stack — all 4 cards always in DOM, CSS positions handle the animation.
               pos0=front, pos1=back, pos2=hidden@back, pos3=hidden@front.
               Incrementing cardOffset rotates which card is in which position.
               Zero state swaps, zero instant resets — pure CSS transitions only. */}
          <div className="hv2-hero-visual">
            {tutors.map((tutor, i) => {
              const pos = ((i - cardOffset) % N + N) % N;
              const hidden = pos >= 2;
              return (
                <div
                  key={tutor.initials}
                  className={`hv2-tutor-card hv2-card-pos${pos}`}
                  aria-hidden={hidden ? 'true' : undefined}
                >
                  <div className="hv2-card-available">
                    <span className="hv2-available-dot" />
                    Available today
                  </div>
                  <div className="hv2-card-avatar" style={{ background: tutor.color }}>{tutor.initials}</div>
                  <div className="hv2-card-name">{tutor.name}</div>
                  <div className="hv2-card-subject">{tutor.subject}</div>
                  <div className="hv2-card-meta">
                    <span className="hv2-card-rating">
                      <FontAwesomeIcon icon={faStar} /> {tutor.rating}
                    </span>
                    <span className="hv2-card-uni">{tutor.uni}</span>
                  </div>
                  <div className="hv2-card-price">{tutor.price}</div>
                  <Link to="/signup" className="hv2-card-book-btn" tabIndex={hidden ? -1 : 0}>
                    Book a lesson <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── UNIVERSITY LOGOS ─────────────────────────────── */}
      <section className="hv2-unis">
        <p className="hv2-unis-label">Our tutors come from Canada's top universities</p>
        <div className="hv2-logo-slider">
          <div className="hv2-logo-track">
            {/* 4× duplicates so the track is always wider than any screen — guarantees seamless loop */}
            {[...uniLogos, ...uniLogos, ...uniLogos, ...uniLogos].map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="hv2-how">
        <div className="hv2-container">
          <div className="hv2-section-eyebrow">How it works</div>
          <h2 className="hv2-section-title">Three steps to your first lesson</h2>
          <div className="hv2-steps">
            <div className="hv2-step">
              <div className="hv2-step-num">01</div>
              <FontAwesomeIcon icon={faGraduationCap} className="hv2-step-icon" />
              <h3>Find your tutor</h3>
              <p>
                Browse vetted university students by subject, grade level, and
                availability. Every tutor is personally reviewed.
              </p>
            </div>
            <div className="hv2-step-connector" />
            <div className="hv2-step">
              <div className="hv2-step-num">02</div>
              <FontAwesomeIcon icon={faCalendarCheck} className="hv2-step-icon" />
              <h3>Book a session</h3>
              <p>
                Pick a time that works for you. Secure payment in CAD — clear
                pricing, no hidden fees, no subscriptions.
              </p>
            </div>
            <div className="hv2-step-connector" />
            <div className="hv2-step">
              <div className="hv2-step-num">03</div>
              <FontAwesomeIcon icon={faBookOpen} className="hv2-step-icon" />
              <h3>Start learning</h3>
              <p>
                Join your lesson from anywhere. Message your tutor, track
                progress, and rebook whenever you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="hv2-stats" ref={statsRef}>
        {/* Stats row */}
        <div className="hv2-stats-top">
          <div className="hv2-container">
            <div className="hv2-stats-rule" />
            <div className="hv2-stats-grid">
              <div className="hv2-stat">
                <div className="hv2-stat-number">200+</div>
                <div className="hv2-stat-label">Students served across Canada</div>
              </div>
              <div className="hv2-stat">
                <div className="hv2-stat-number">97%</div>
                <div className="hv2-stat-label">See improvement within 2 months</div>
              </div>
              <div className="hv2-stat">
                <div className="hv2-stat-number">$25</div>
                <div className="hv2-stat-label">Starting price per session (CAD)</div>
              </div>
              <div className="hv2-stat">
                <div className="hv2-stat-number">5+</div>
                <div className="hv2-stat-label">Top Canadian universities represented</div>
              </div>
            </div>
            <div className="hv2-stats-rule" />
          </div>
        </div>
        {/* Interactive canvas — fills area below stats */}
        <div className="hv2-stats-canvas-wrap" ref={canvasWrapRef}>
          <canvas ref={canvasRef} className="hv2-stats-canvas" />
        </div>
      </section>

      {/* ── PRICING PREVIEW ──────────────────────────────── */}
      <section className="hv2-pricing-preview">
        <div className="hv2-container">
          <div className="hv2-section-eyebrow">Pricing</div>
          <h2 className="hv2-section-title">Clear, simple pricing in CAD</h2>
          <p className="hv2-section-sub">No subscriptions. No hidden fees. Pay per session.</p>
          <div className="hv2-pricing-cards">

            <div className="hv2-pricing-card">
              <div className="hv2-pricing-grade">Grades 1–8</div>
              <div className="hv2-pricing-amount">$25 <span>CAD</span></div>
              <div className="hv2-pricing-per">per session</div>
              <ul className="hv2-pricing-features">
                <li><FontAwesomeIcon icon={faCircleCheck} /> 1-on-1 online session</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> All core subjects</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> Flexible scheduling</li>
              </ul>
            </div>

            <div className="hv2-pricing-card hv2-pricing-featured">
              <div className="hv2-pricing-badge">Most popular</div>
              <div className="hv2-pricing-grade">Grades 9–10</div>
              <div className="hv2-pricing-amount">$30 <span>CAD</span></div>
              <div className="hv2-pricing-per">per session</div>
              <ul className="hv2-pricing-features">
                <li><FontAwesomeIcon icon={faCircleCheck} /> 1-on-1 online session</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> All subjects</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> Flexible scheduling</li>
              </ul>
            </div>

            <div className="hv2-pricing-card">
              <div className="hv2-pricing-grade">Grades 11–12</div>
              <div className="hv2-pricing-amount">$35 <span>CAD</span></div>
              <div className="hv2-pricing-per">per session</div>
              <ul className="hv2-pricing-features">
                <li><FontAwesomeIcon icon={faCircleCheck} /> 1-on-1 online session</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> Advanced subjects</li>
                <li><FontAwesomeIcon icon={faCircleCheck} /> Flexible scheduling</li>
              </ul>
            </div>

          </div>
          <Link to="/pricing" className="hv2-pricing-link">
            See full pricing details <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="hv2-cta-final">
        <div className="hv2-container">
          <h2 className="hv2-cta-final-title">
            Ready for your first lesson?
          </h2>
          <p className="hv2-cta-final-sub">
            Join 200+ students who've improved their grades with Academathon.
            Your first lesson is just a few clicks away.
          </p>
          <div className="hv2-cta-final-actions">
            <Link to="/signup" className="hv2-cta-primary hv2-cta-large">
              Get started — it's free
            </Link>
            <Link to="/login" className="hv2-cta-ghost-dark">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <VoiceAgent />
    </div>
  );
}

export default HomeV2;
