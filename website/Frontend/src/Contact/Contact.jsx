import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPaperPlane,
  faUser,
  faComment,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import emailjs from '@emailjs/browser';
import Footer from '../components/Footer/Footer';
import './Contact.css';
s
// EmailJS configuration - replace with your actual IDs
const EMAILJS_SERVICE_ID = 'service_r11ndie';
const EMAILJS_TEMPLATE_ID = 'template_d3c1gsd';
const EMAILJS_PUBLIC_KEY = 'LSTa3sfNzhF3cvB9o'; // Get this from EmailJS dashboard

const Contact = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map EmailJS field names to formData keys
    const fieldMap = {
      'from_name': 'name',
      'subject': 'subject',
      'message': 'message'
    };
    const formField = fieldMap[name] || name;
    
    setFormData(prev => ({
      ...prev,
      [formField]: value
    }));
    // Clear error when user starts typing
    if (errors[formField]) {
      setErrors(prev => ({
        ...prev,
        [formField]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Send email using EmailJS
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      
      setIsSubmitted(true);
      setFormData({ name: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitError('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
        <div className="contact-hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-container">
          <div className="contact-info-panel">
            <h2>Contact Information</h2>
            <p className="info-subtitle">Fill out the form and our team will get back to you within 24 hours.</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className="contact-text">
                  <span className="contact-label">Email</span>
                  <a href="mailto:academathontutoring@gmail.com">academathontutoring@gmail.com</a>
                </div>
              </div>
            </div>
            
            <div className="contact-social">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://linkedin.com/company/academathon" target="_blank" rel="noopener noreferrer" className="social-btn">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="https://facebook.com/academathon" target="_blank" rel="noopener noreferrer" className="social-btn">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="https://instagram.com/academathon" target="_blank" rel="noopener noreferrer" className="social-btn">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            {isSubmitted ? (
              <div className="success-message">
                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
                {/* Hidden field for recipient email */}
                <input type="hidden" name="to_email" value="ryant012015@gmail.com" />
                
                {submitError && (
                  <div className="submit-error">
                    {submitError}
                  </div>
                )}
                
                <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="from_name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                
                <div className={`form-group ${errors.subject ? 'has-error' : ''}`}>
                  <label htmlFor="subject">
                    <FontAwesomeIcon icon={faComment} className="input-icon" />
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>
                
                <div className={`form-group ${errors.message ? 'has-error' : ''}`}>
                  <label htmlFor="message">
                    <FontAwesomeIcon icon={faPaperPlane} className="input-icon" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>
                
                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="contact-faq">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I book a tutor?</h3>
              <p>Simply create an account, browse our tutors, and book a session that fits your schedule.</p>
            </div>
            <div className="faq-item">
              <h3>What subjects do you offer?</h3>
              <p>We offer tutoring in Math, Science, English, and many more subjects for grades 1-12.</p>
            </div>
            <div className="faq-item">
              <h3>How do I become a tutor?</h3>
              <p>Apply through our tutor registration page. We'll review your qualifications and get back to you.</p>
            </div>
            <div className="faq-item">
              <h3>What are your rates?</h3>
              <p>Rates vary by tutor and subject. You can view each tutor's hourly rate on their profile.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

