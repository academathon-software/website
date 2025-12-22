import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Connect with Expert Tutors
              <span className="highlight"> Instantly</span>
            </h1>
            <p className="hero-description">
              Join thousands of students who are achieving their academic goals with personalized tutoring from qualified educators. Get help when you need it, where you need it.
            </p>
            <div className="hero-buttons">
              <a href="/signup" className="btn btn-primary">Get Started Free</a>
              <a href="/login" className="btn btn-secondary">Sign In</a>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <div className="floating-card card-1">
                <div className="card-icon">📚</div>
                <span>Math</span>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">🔬</div>
                <span>Science</span>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🌍</div>
                <span>History</span>
              </div>
              <div className="floating-card card-4">
                <div className="card-icon">💻</div>
                <span>Programming</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Academathon?</h2>
            <p>We make learning accessible, effective, and enjoyable for everyone</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Get customized lessons tailored to your learning style and pace. Our tutors adapt to your needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>24/7 Availability</h3>
              <p>Access help whenever you need it. Our platform connects you with tutors around the clock.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Expert Tutors</h3>
              <p>Learn from qualified educators with proven track records in their respective subjects.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Affordable Rates</h3>
              <p>Quality education shouldn't break the bank. We offer competitive pricing for all students.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Intuitive platform designed for seamless learning experience across all devices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed progress reports and performance analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Students Say</h2>
            <p>Real feedback from real students who've achieved their goals</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Academathon helped me improve my math grades from C to A+. The tutors are amazing and really care about your success!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🎓</div>
                <div className="author-info">
                  <div className="author-name">Sarah Johnson</div>
                  <div className="author-title">High School Student</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The programming tutors on this platform are incredible. I landed my dream job thanks to their guidance and support."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💻</div>
                <div className="author-info">
                  <div className="author-name">Mike Chen</div>
                  <div className="author-title">Computer Science Graduate</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a working professional, the flexible scheduling was perfect. I could study at my own pace and still get expert help."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍💼</div>
                <div className="author-info">
                  <div className="author-name">Emily Rodriguez</div>
                  <div className="author-title">Business Professional</div>
                </div>
              </div>
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
              <a href="/signup" className="btn btn-primary btn-large">Start Learning Today</a>
              <a href="/login" className="btn btn-primary btn-large">Sign In</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;