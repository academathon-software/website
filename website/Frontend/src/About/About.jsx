import React from 'react';
import './About.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faUsers, 
  faLightbulb, 
  faGlobe, 
  faHeart,
  faTrophy,
  faBookOpen,
  faChalkboardTeacher,
  faUserGraduate,
  faRocket,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>About Academathon</h1>
            <p className="hero-subtitle">
              Empowering students through personalized tutoring and innovative learning experiences
            </p>
            <div className="hero-stats">
              <div className="stat">
                <FontAwesomeIcon icon={faUsers} />
                <span>50+</span>
                <p>Students Helped</p>
              </div>
              <div className="stat">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
                <span>20+</span>
                <p>Expert Tutors</p>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card">
              <FontAwesomeIcon icon={faGraduationCap} />
              <h3>Quality Education</h3>
              <p>For Everyone, Everywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Mission</h2>
            <p>Bridging the gap between students and quality education through technology</p>
          </div>
          <div className="mission-content">
            <div className="mission-text">
              <h3>Making Education Accessible</h3>
              <p>
              At Academathon, we’re dedicated to more than just helping students succeed in exams — we’re here to empower them to reach their full potential. Our personalized tutoring approach extends beyond academic support; we focus on building the skills, confidence, and mindset needed to thrive in today’s competitive world. Whether you’re gearing up for university, advancing your career, or aiming to boost your grades, Academathon is committed to guiding and supporting you every step of the way.
              </p>
              <div className="mission-features">
                <div className="feature">
                  <FontAwesomeIcon icon={faLightbulb} />
                  <div>
                    <h4>Innovative Learning</h4>
                    <p>Cutting-edge tools and methods for effective learning</p>
                  </div>
                </div>
                <div className="feature">
                  <FontAwesomeIcon icon={faHeart} />
                  <div>
                    <h4>Personalized Approach</h4>
                    <p>Tailored learning experiences for every student</p>
                  </div>
                </div>
                <div className="feature">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <div>
                    <h4>Safe Environment</h4>
                    <p>Secure platform with verified tutors and students</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="visual-card">
                <FontAwesomeIcon icon={faRocket} />
                <h4>Launch Your Success</h4>
                <p>Join thousands of students who have achieved their academic goals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
              <h3>Excellence</h3>
              <p>We strive for the highest quality in education and service delivery, ensuring every interaction adds value to the learning journey.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Community</h3>
              <p>Building a supportive learning community where students and tutors collaborate to achieve shared educational goals.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              <h3>Innovation</h3>
              <p>Continuously evolving our platform with new technologies and teaching methods to enhance the learning experience.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h3>Empathy</h3>
              <p>Understanding each student's unique challenges and providing compassionate support throughout their learning journey.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <h3>Achievement</h3>
              <p>Celebrating every milestone and success, no matter how small, to build confidence and motivation.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <h3>Accessibility</h3>
              <p>Making quality education available to students worldwide, breaking down geographical and economic barriers.</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join thousands of students who are already achieving their academic goals with Academathon.</p>
            <div className="cta-buttons">
              <a href="/signup" className="btn-primary">
                <FontAwesomeIcon icon={faUserGraduate} />
                Get Started as Student
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

export default About;
