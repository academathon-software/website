import React from 'react';
import './About.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faHeart,
  faLightbulb,
  faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';

const values = [
  {
    icon: faBullseye,
    title: 'Our Mission',
    description: 'To make quality education accessible to everyone through personalized online learning that adapts to each student\'s unique learning style.'
  },
  {
    icon: faHeart,
    title: 'Student-Centered',
    description: 'We put students first, creating a supportive environment where learners feel confident to ask questions and make mistakes.'
  },
  {
    icon: faLightbulb,
    title: 'Innovation',
    description: 'We leverage the latest educational technology and teaching methods to deliver the most effective learning experiences.'
  },
  {
    icon: faArrowTrendUp,
    title: 'Continuous Growth',
    description: 'We believe in constant improvement for both our students and tutors, fostering a culture of lifelong learning.'
  }
];

const impact = [
  {
    title: 'Grade Improvement',
    stat: '85% of our students see measurable improvement in their grades within 2 months.'
  },
  {
    title: 'Student Satisfaction',
    stat: '98% satisfaction rating, with over 50 positive reviews.'
  },
  {
    title: 'Tutor Quality',
    stat: 'All tutors are certified educators with an average of 5 years teaching experience.'
  },
  {
    title: 'Global Reach',
    stat: 'Students from over Ontario, Canada have benefited from our platform.'
  }
];

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <h1>About Academathon</h1>
          <p className="about-subtitle">
            Empowering students worldwide with personalized education that inspires confidence and drives success.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-container">
          <h2>Our Mission</h2>
          <div className="story-text">
            <p>
            At Academathon, we’re dedicated to more than just helping students succeed in exams — we’re here to empower them to reach their full potential. Our personalized tutoring approach extends beyond academic support; we focus on building the skills, confidence, and mindset needed to thrive in today’s competitive world. Whether you’re gearing up for university, advancing your career, or aiming to boost your grades, Academathon is committed to guiding and supporting you every step of the way.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-impact">
        <div className="about-container">
          <h2>Our Impact</h2>
          <div className="impact-grid">
            {impact.map((item, index) => (
              <div key={index} className="impact-card">
                <h3>{item.title}</h3>
                <p>{item.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
