import React from 'react';
import './Team.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faLightbulb, 
  faHeart,
  faRocket,
  faShieldAlt,
  faUsers,
  faGlobe,
  faCode,
  faChalkboardTeacher,
  faUserGraduate,
  faEnvelope,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import sahilImage from '../assets/sahil.avif';

function Team() {
  const teamMembers = [
    {
      name: "Sahil Talati",
      role: "Founder",
      bio: "Sahil is currently pursuing a Computer Science degree with a concentration in Big Data Systems at Wilfrid Laurier University. With a strong passion for technology, he has gained extensive experience through internships, where he worked on innovative software solutions and advanced data systems. His expertise spans software development, cloud technologies, and data-driven problem-solving. ",
      image: sahilImage,
      color: "#10b981",
      social: {
        linkedin: "https://www.linkedin.com/in/sahil-talati/",
        twitter: "https://twitter.com/sarahjohnson",
        email: "sahil@academathon.com"
      },
      expertise: ["Educational Technology", "Strategic Planning", "Leadership"]
    },
    {
      name: "Ryan Tang",
      role: "CTO",
      bio: "Ryan is currently a computer science student at Wilfrid Laurier University with a concentration in AI, and a full-stack developer focused on building scalable technology solutions. He leads platform architecture, backend systems, and product development, with expertise in cloud infrastructure, modern web technologies, and AI-powered features. Ryan is driven by creating reliable, high-performance systems that enhance learning experiences.",
      
      color: "#3b82f6",
      social: {
        linkedin: "https://www.linkedin.com/in/ryan-tng/",
        github: "https://github.com/ryantng05",
        email: "ryant012015@gmail.com"
      },
      expertise: ["Full-Stack Development", "Cloud Architecture", "AI/ML"]
    }
  ];

  const stats = [
    { icon: faUsers, number: "30+", label: "Team Members" },
    { icon: faGraduationCap, number: "15+", label: "Years Combined Experience" },
  ];

  return (
    <div className="team-page">
      {/* Hero Section */}
      <section className="team-hero">
        <div className="team-container">
          <div className="team-hero-content">
            <h1>Meet Our Team</h1>
            <p className="team-hero-subtitle">
            Academathon was founded in February 2021 to support students struggling with online learning during the pandemic. What began as a small initiative to provide accessible tutoring has quickly grown into a large platform, connecting students with expert tutors across various subjects. Through personalized learning and dedicated support, we've helped countless students adapt to new challenges, improve their skills, and thrive in an ever-changing academic environment.
            </p>
            <div className="team-hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="team-stat-item">
                  <div className="team-stat-icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div className="team-stat-number">{stat.number}</div>
                  <div className="team-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="leadership-section">
        <div className="team-container">
          <div className="team-section-header">
            <h2>Leadership Team</h2>
            <p>The visionaries leading Academathon's mission to democratize education</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-avatar">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  
                  <div className="member-expertise">
                    <h4>Expertise</h4>
                    <div className="expertise-tags">
                      {member.expertise.map((skill, skillIndex) => (
                        <span key={skillIndex} className="expertise-tag">{skill}</span>
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

      {/* Culture Section */}
      <section className="culture-section">
        <div className="team-container">
          <div className="team-section-header">
            <h2>Our Culture</h2>
            <p>What makes Academathon a great place to work</p>
          </div>
          <div className="culture-grid">
            <div className="culture-card">
              <div className="culture-icon">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h3>Passion for Education</h3>
              <p>Every team member is driven by the belief that quality education should be accessible to all students worldwide.</p>
            </div>
            <div className="culture-card">
              <div className="culture-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Collaborative Spirit</h3>
              <p>We work together as one team, supporting each other and our users to achieve common goals.</p>
            </div>
            <div className="culture-card">
              <div className="culture-icon">
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              <h3>Innovation First</h3>
              <p>We embrace new ideas and technologies to continuously improve the learning experience.</p>
            </div>
            <div className="culture-card">
              <div className="culture-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>Trust & Transparency</h3>
              <p>We maintain open communication and build trust with our team, users, and partners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="join-us-section">
        <div className="team-container">
          <div className="join-content">
            <h2>Join Our Mission</h2>
            <p>We're always looking for passionate individuals who want to make a difference in education. Come help us build the future of learning.</p>
            <div className="join-buttons">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSf-QDRnM5yjm9n7D713aiLNlLQyTyLgvD_tIdP7VcG1RNqRrA/viewform" target="_blank" rel="noopener noreferrer" className="btn-primary">
                <FontAwesomeIcon icon={faUserGraduate} />
                Apply Here
              </a>
              <a href="/contact" className="btn-secondary">
                <FontAwesomeIcon icon={faEnvelope} />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Team;
