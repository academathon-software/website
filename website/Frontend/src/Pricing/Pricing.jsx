import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faTimes, 
  faStar, 
  faUsers, 
  faGraduationCap,
  faChalkboardTeacher
} from '@fortawesome/free-solid-svg-icons';

function Pricing() {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Grades 1-8",
      description: "",
      hourlyPrice: 25,
      icon: faGraduationCap,
      color: "#10b981",
      features: [
        
      ],
      limitations: [
        
      ],
      popular: false
    },
    {
      name: "Grades 9-10",
      description: "",
      hourlyPrice: 30,
      icon: faStar,
      color: "#f59e0b",
      features: [
        
      ],
      limitations: [

      ],
      popular: true
    },
    {
      name: "Grades 11-12",
      description: "",
      hourlyPrice: 35,
      icon: faUsers,
      color: "#8b5cf6",
      features: [
        
      ],
      limitations: [
        
      ],
      popular: false
    }
  ];


  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences."
    },
    {
      question: "What subjects are available?",
      answer: "We offer tutoring in over 50 subjects including Math, Science, English, History, Computer Science, Languages, and many more."
    },
    {
      question: "How do I book a session?",
      answer: "Simply browse available tutors, check their schedules, and book a session that works for you. You'll receive a confirmation email with session details."
    },
    {
      question: "What if I'm not satisfied with a session?",
      answer: "We offer a 100% satisfaction guarantee. If you're not happy with a session, we'll provide a full refund or help you find a better tutor match."
    },
  ];

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Simple, Transparent Pricing</h1>
            <p className="hero-subtitle">
              Choose the perfect plan for your learning journey. No hidden fees, no surprises.
            </p>
            {/*<div className="billing-info">
              <p className="billing-description">Pay per hour - no monthly commitments</p>
            </div>*/}
          </div>
        </div>
      </section>

      {/* Student Plans */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>For Students</h2>
            <p>Choose the plan that fits your learning needs</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">
                    <FontAwesomeIcon icon={faStar} />
                    Most Popular
                  </div>
                )}
                <div className="plan-header">
                  <div className="plan-icon" style={{ backgroundColor: plan.color }}>
                    <FontAwesomeIcon icon={plan.icon} />
                  </div>
                  <h3>{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <div className="plan-pricing">
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">
                      {plan.hourlyPrice}
                    </span>
                    <span className="period">/hour</span>
                  </div>
                </div>
                <div className="plan-features">
                 {/* <h4>What's included:</h4> */}
                  <ul>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>
                        <FontAwesomeIcon icon={faCheck} className="check-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.limitations.length > 0 && (
                    <>
                      <h4>Limitations:</h4>
                      <ul className="limitations">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex}>
                            <FontAwesomeIcon icon={faTimes} className="times-icon" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <button 
                  className={`plan-button ${plan.popular ? 'popular' : ''}`}
                  style={{ backgroundColor: plan.color }}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our pricing</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Learning?</h2>
            <p>Join thousands of students who are already achieving their goals with Academathon.</p>
            <div className="cta-buttons">
              <a href="/signup" className="btn-primary">
                <FontAwesomeIcon icon={faGraduationCap} />
                Start as Student
              </a>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSf-QDRnM5yjm9n7D713aiLNlLQyTyLgvD_tIdP7VcG1RNqRrA/viewform" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
                Become a Tutor
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Pricing;
