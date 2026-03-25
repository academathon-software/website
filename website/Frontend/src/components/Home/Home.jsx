import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Footer from '../Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faUsers, faChartLine, faClock } from '@fortawesome/free-solid-svg-icons';
import waterlooLogo from '../../assets/waterloo.png';
import mcgillLogo from '../../assets/mcgill.png';
import mcmasterLogo from '../../assets/mcmaster.png';
import westernLogo from '../../assets/western.png';
import torontoLogo from '../../assets/toronto.png';

const features = [
  {
    icon: faBookOpen,
    title: 'Expert Tutors',
    description: 'Learn from certified educators with years of experience.'
  },
  {
    icon: faUsers,
    title: 'Personalized Learning',
    description: 'Customized lesson plans tailored to your learning style.'
  },
  {
    icon: faChartLine,
    title: 'Proven Results',
    description: '97% of our students see significant improvement within 3 months.'
  },
  {
    icon: faClock,
    title: 'Flexible Schedule',
    description: 'Book sessions at times that work best for you.'
  }
];

function Home() {
  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">1-on-1 Virtual Tutoring Services for Grades 1-12</h1>
          <p className="hero-description">
            Connect with expert tutors who are passionate about helping you succeed.
            Personalized online tutoring for all subjects and skill levels.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/pricing" className="btn-outline">View Pricing</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Academathon?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="universities-section">
        <div className="container">
          <h2 className="universities-title">Qualified Tutors From Top Universities</h2>
          <div className="logo-slider">
            <div className="logo-track">
              <img src={waterlooLogo} alt="University of Waterloo" className="university-logo" />
              <img src={mcgillLogo} alt="McGill University" className="university-logo" />
              <img src={mcmasterLogo} alt="McMaster University" className="university-logo" />
              <img src={westernLogo} alt="Western University" className="university-logo" />
              <img src={torontoLogo} alt="University of Toronto" className="university-logo" />
              <img src={waterlooLogo} alt="University of Waterloo" className="university-logo" />
              <img src={mcgillLogo} alt="McGill University" className="university-logo" />
              <img src={mcmasterLogo} alt="McMaster University" className="university-logo" />
              <img src={westernLogo} alt="Western University" className="university-logo" />
              <img src={torontoLogo} alt="University of Toronto" className="university-logo" />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Learning?</h2>
          <p>Join many students who have transformed their academic journey with Academathon.</p>
          <Link to="/signup" className="cta-btn">Get Started Today</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
