import React from 'react';
import './About.css';
import Footer from '../components/Footer/Footer';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faHeart,
  faLightbulb,
  faArrowTrendUp,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const stats = [
  { number: '200+',  label: 'Students served' },
  { number: '98%',   label: 'Satisfaction rate' },
  { number: '85%',   label: 'See grade improvement' },
  { number: '2021',  label: 'Founded' },
];

const values = [
  {
    icon: faBullseye,
    title: 'Our Mission',
    description:
      'To make quality education accessible to every student across Canada through personalized, one-on-one tutoring that meets them where they are.',
  },
  {
    icon: faHeart,
    title: 'Student-Centered',
    description:
      "We put students first — building confidence, not just grades. Every lesson is designed around how that student learns, not a one-size-fits-all script.",
  },
  {
    icon: faLightbulb,
    title: 'Vetted Tutors',
    description:
      'Every tutor is a university student with proven subject expertise, hand-selected through our invite-only process — no random marketplace signups.',
  },
  {
    icon: faArrowTrendUp,
    title: 'Real Results',
    description:
      '85% of students see measurable grade improvement within the first two months of working with an Academathon tutor. Progress you can show a report card.',
  },
];

export default function About() {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-container">
          <p className="about-eyebrow">Our Story</p>
          <h1 className="about-h1">
            Built to give every student<br />
            <em>a fair shot.</em>
          </h1>
          <p className="about-subtitle">
            Academathon started as a small tutoring initiative in 2021. Today it's a
            platform connecting hundreds of Canadian students with university tutors
            who genuinely care about seeing them succeed.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="about-story">
        <div className="about-container about-story-grid">
          <blockquote className="about-pullquote">
            <span className="pullquote-bar" />
            <p>"We're dedicated to more than helping students pass exams — we're here to empower them to reach their full potential."</p>
          </blockquote>
          <div className="about-story-body">
            <p>
              At Academathon, personalized tutoring goes beyond academic support. We focus on
              building the skills, confidence, and mindset needed to thrive — whether you're
              preparing for university, strengthening your foundations, or aiming for that
              grade that opens the next door.
            </p>
            <p>
              What started as a way to keep students learning during the pandemic has grown
              into a full platform, built on the same human touch that made the original
              service so effective. Over 200 students. 18 subjects. One simple goal.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats-row">
            {stats.map((s, i) => (
              <div key={i} className="about-stat-item">
                <span className="about-stat-number">{s.number}</span>
                <span className="about-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="about-values">
        <div className="about-container">
          <p className="about-overline">What we stand for</p>
          <h2 className="about-h2">Our values</h2>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon-wrap">
                  <FontAwesomeIcon icon={v.icon} />
                </div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="about-container about-cta-inner">
          <p className="about-cta-overline">Ready to start?</p>
          <h2 className="about-cta-h2">Find your tutor today.</h2>
          <p className="about-cta-sub">
            Browse tutors across 18 subjects. Pay per lesson — no subscription needed.
          </p>
          <Link to="/signup" className="about-cta-btn">
            Get started <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
