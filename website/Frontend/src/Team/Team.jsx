import React, { useState, useEffect } from 'react';
import './Team.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faUsers,
  faLightbulb,
  faShieldAlt,
  faEnvelope,
  faUserGraduate,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import sahilImage from '../assets/sahil.avif';
import ryanImage from '../assets/ryan-tang.png';

const teamMembers = [
  {
    name: "Sahil Talati",
    role: "Founder",
    bio: "Sahil is currently pursuing a Computer Science degree with a concentration in Big Data Systems at Wilfrid Laurier University. With a strong passion for technology, he has gained extensive experience through internships, where he worked on innovative software solutions and advanced data systems. His expertise spans software development, cloud technologies, and data-driven problem-solving.",
    image: sahilImage,
    social: {
      linkedin: "https://www.linkedin.com/in/sahil-talati/",
      twitter: "https://twitter.com/sarahjohnson",
      email: "sahil@academathon.ca"
    },
    expertise: ["Educational Technology", "Strategic Planning", "Leadership"]
  },
  {
    name: "Ryan Tang",
    role: "CTO",
    bio: "Ryan is currently a computer science student at Wilfrid Laurier University with a concentration in AI, and a full-stack developer focused on building scalable technology solutions. He leads platform architecture, backend systems, and product development, with expertise in cloud infrastructure, modern web technologies, and AI-powered features. Ryan is driven by creating reliable, high-performance systems that enhance learning experiences.",
    image: ryanImage,
    social: {
      linkedin: "https://www.linkedin.com/in/ryan-tng/",
      github: "https://github.com/ryan-tng",
      email: "ryant012015@gmail.com"
    },
    expertise: ["Full-Stack Development", "Cloud Architecture", "AI/ML"]
  }
];

const cultureItems = [
  {
    icon: faHeart,
    title: 'Passion for Education',
    description: 'Every team member is driven by the belief that quality education should be accessible to all students worldwide.'
  },
  {
    icon: faUsers,
    title: 'Collaborative Spirit',
    description: 'We work together as one team, supporting each other and our users to achieve common goals.'
  },
  {
    icon: faLightbulb,
    title: 'Innovation First',
    description: 'We embrace new ideas and technologies to continuously improve the learning experience.'
  },
  {
    icon: faShieldAlt,
    title: 'Trust & Transparency',
    description: 'We maintain open communication and build trust with our team, users, and partners.'
  }
];

function Team() {
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (!photoPreview) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPhotoPreview(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [photoPreview]);

  return (
    <div className="team-page">
      <section className="team-hero">
        <div className="team-container">
          <h1>Meet Our Team</h1>
          <p className="team-subtitle">
          Academathon was founded in February 2021 to support students struggling with online learning during the pandemic. What began as a small initiative to provide accessible tutoring has quickly grown into a large platform, connecting students with expert tutors across various subjects. Through personalized learning and dedicated support, we've helped countless students adapt to new challenges, improve their skills, and thrive in an ever-changing academic environment.
          </p>
        </div>
      </section>

      <section className="team-leadership">
        <div className="team-container">
          <h2>Leadership Team</h2>
          <p className="team-section-subtitle">The visionaries leading Academathon's mission to democratize education</p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-avatar">
                  {member.image ? (
                    <button
                      type="button"
                      className="member-avatar-button"
                      onClick={() => setPhotoPreview({ name: member.name, image: member.image })}
                      aria-label={`View larger photo of ${member.name}`}
                    >
                      <img src={member.image} alt={member.name} />
                    </button>
                  ) : (
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faUserGraduate} />
                    </div>
                  )}
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                  <p className="member-bio">{member.bio}</p>
                  <div className="member-expertise">
                    <h4>Expertise</h4>
                    <div className="expertise-tags">
                      {member.expertise.map((skill, i) => (
                        <span key={i} className="expertise-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="member-social">
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FontAwesomeIcon icon={faLinkedin} />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FontAwesomeIcon icon={faTwitter} />
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <FontAwesomeIcon icon={faGithub} />
                      </a>
                    )}
                    {member.social.email && (
                      <a href={`mailto:${member.social.email}`} className="social-link">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-culture">
        <div className="team-container">
          <h2>Our Culture</h2>
          <p className="team-section-subtitle">What makes Academathon a great place to work</p>
          <div className="culture-grid">
            {cultureItems.map((item, index) => (
              <div key={index} className="culture-card">
                <div className="culture-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-cta">
        <div className="team-container">
          <h2>Want to Join Our Team?</h2>
          <p>We're always looking for passionate educators to join our community.</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf-QDRnM5yjm9n7D713aiLNlLQyTyLgvD_tIdP7VcG1RNqRrA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="team-cta-btn"
          >
            Apply as a Tutor
          </a>
        </div>
      </section>

      {photoPreview && (
        <div
          className="team-photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${photoPreview.name} photo`}
          onClick={() => setPhotoPreview(null)}
        >
          <div
            className="team-photo-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="team-photo-lightbox-close"
              onClick={() => setPhotoPreview(null)}
              aria-label="Close photo"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img
              src={photoPreview.image}
              alt={photoPreview.name}
              className="team-photo-lightbox-image"
            />
            <p className="team-photo-lightbox-caption">{photoPreview.name}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Team;
