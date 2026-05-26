import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faChevronDown,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const features = [
  'Live one-on-one sessions',
  'Vetted university tutors',
  '18 subjects available',
  'Flexible scheduling',
  'Pay per lesson — no subscription',
  'Full refund if tutor declines',
];

const pricingPlans = [
  {
    name: 'Grades 1–8',
    tagline: 'Foundations',
    description: 'Elementary and middle school support across core subjects.',
    hourlyPrice: 25,
    popular: false,
  },
  {
    name: 'Grades 9–10',
    tagline: 'High School',
    description: 'Build strong academic habits heading into your senior years.',
    hourlyPrice: 30,
    popular: false,
  },
  {
    name: 'Grades 11–12',
    tagline: 'University Prep',
    description: 'Advanced support to secure the grades that matter most.',
    hourlyPrice: 35,
    popular: true,
  },
];

const steps = [
  {
    num: '01',
    title: 'Request a session',
    desc: 'Browse tutors, pick a subject and time that works. Save your card — nothing is charged yet.',
  },
  {
    num: '02',
    title: 'Tutor confirms',
    desc: 'Your card is charged only once the tutor accepts. If they decline, you owe nothing.',
  },
  {
    num: '03',
    title: 'Learn',
    desc: 'Join your live session. Cancel with enough notice and receive a full refund — no questions asked.',
  },
];

const faqs = [
  {
    question: 'Is there a subscription or monthly commitment?',
    answer:
      'No — Academathon is pay-as-you-go. You\'re only charged for the lessons you book, at the hourly rate for your grade level ($25/hr for Grades 1–8, $30/hr for Grades 9–10, $35/hr for Grades 11–12, in CAD). There are no plans to upgrade, downgrade, or cancel.',
  },
  {
    question: 'When am I charged for a lesson?',
    answer:
      'You save your card when you request a lesson, but nothing is charged yet. Your card is only charged once the tutor accepts the request. If the tutor declines, or doesn\'t respond before the deadline, your card is never charged. Cancel in time and you\'ll get a full refund.',
  },
  {
    question: 'What subjects are available?',
    answer:
      'We currently offer tutoring across 18 subjects: Math, English, Science, French, History, Computer Science, Business, Advanced Functions, Functions, Calculus & Vectors, Chemistry, Social Studies, Physics, Biology, Accounting, Data Management, Stats & Probability, and Economics.',
  },
  {
    question: 'How do I book a session?',
    answer:
      'Create a free account, browse available tutors, and pick a subject and time slot that works for you. Submit a booking request — the tutor has a window to accept, and you\'ll receive a confirmation once it\'s locked in.',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pricing-page">

      {/* ── Hero ── */}
      <section className="pricing-hero">
        <div className="pricing-container">
          <p className="pricing-eyebrow">Simple Pricing</p>
          <h1 className="pricing-h1">
            Pay per lesson.<br />
            <em>Nothing more.</em>
          </h1>
          <p className="pricing-subtitle">
            No subscription. No hidden fees. Just honest, per-lesson pricing in CAD
            based on your grade level.
          </p>
          <div className="pricing-trust-row">
            <span className="trust-badge">No subscription</span>
            <span className="trust-divider" aria-hidden="true">·</span>
            <span className="trust-badge">Priced in CAD</span>
            <span className="trust-divider" aria-hidden="true">·</span>
            <span className="trust-badge">Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── How billing works ── */}
      <section className="pricing-how">
        <div className="pricing-container">
          <p className="pricing-overline">How it works</p>
          <h2 className="pricing-h2">Billing in 3 steps</h2>
          <div className="how-steps">
            {steps.map((step, i) => (
              <div key={i} className="how-step">
                <span className="step-num">{step.num}</span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="pricing-plans">
        <div className="pricing-container">
          <p className="pricing-overline">Choose your level</p>
          <h2 className="pricing-h2">Rates by grade</h2>
          <div className="pricing-grid">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`pricing-card${plan.popular ? ' popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">Most popular</div>
                )}
                <p className="plan-tagline">{plan.tagline}</p>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{plan.hourlyPrice}</span>
                  <span className="price-suffix">CAD / hr</span>
                </div>
                <button
                  className={`plan-btn${plan.popular ? ' plan-btn--primary' : ''}`}
                  onClick={() => navigate('/signup')}
                >
                  Get started <FontAwesomeIcon icon={faArrowRight} />
                </button>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {features.map((f, j) => (
                    <li key={j} className="plan-feature">
                      <FontAwesomeIcon icon={faCheck} className="feature-check" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pricing-faq">
        <div className="pricing-container">
          <p className="pricing-overline">Questions</p>
          <h2 className="pricing-h2">Frequently asked</h2>
          <div className="faq-list" role="list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? ' open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                role="listitem"
              >
                <div className="faq-question">
                  <span className="faq-q-text">{faq.question}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`faq-chevron${openFaq === i ? ' rotated' : ''}`}
                    aria-hidden="true"
                  />
                </div>
                {openFaq === i && (
                  <p className="faq-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pricing-cta">
        <div className="pricing-container pricing-cta-inner">
          <p className="pricing-cta-overline">Ready to book?</p>
          <h2 className="pricing-cta-h2">Your first lesson is one click away.</h2>
          <p className="pricing-cta-sub">
            Create a free account and browse tutors across 18 subjects.
            No commitment required.
          </p>
          <button className="pricing-cta-btn" onClick={() => navigate('/signup')}>
            Get started <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
