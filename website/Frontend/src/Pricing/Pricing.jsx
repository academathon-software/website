import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const pricingPlans = [
  {
    name: "Grades 1-8",
    description: "Perfect for elementary and middle school students.",
    hourlyPrice: 25,
    popular: false
  },
  {
    name: "Grades 9-10",
    description: "Ideal for high school students building foundations.",
    hourlyPrice: 30,
    popular: false
  },
  {
    name: "Grades 11-12",
    description: "Advanced support for university preparation.",
    hourlyPrice: 35,
    popular: true
  }
];

const faqs = [
  {
    question: "Can I change my plan later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
  },
  {
    question: "What happens to unused hours?",
    answer: "Unused hours roll over to the next month for up to 3 months on Pro and Premium plans. Starter plan hours do not expire monthly."
  },
  {
    question: "What subjects are available?",
    answer: "We offer tutoring in over 50 subjects including Math, Science, English, History, Computer Science, Languages, and many more."
  },
  {
    question: "How do I book a session?",
    answer: "Simply browse available tutors, check their schedules, and book a session that works for you. You'll receive a confirmation email with session details."
  }
];

function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <div className="pricing-container">
          <h1>Simple, Transparent Pricing</h1>
          <p className="pricing-subtitle">
            Choose the plan that fits your learning goals. All plans include access to our expert tutors.
          </p>
        </div>
      </section>

      <section className="pricing-plans">
        <div className="pricing-container">
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">
                    <FontAwesomeIcon icon={faStar} />
                    Most Popular
                  </div>
                )}
                <h3>{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
                <div className="plan-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{plan.hourlyPrice}</span>
                  <span className="price-period">/hour</span>
                </div>
                <button
                  className={`plan-btn ${plan.popular ? 'popular' : ''}`}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-faq">
        <div className="pricing-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                </div>
                {openFaq === index && (
                  <p className="faq-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Pricing;
