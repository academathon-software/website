import React from 'react';
import './Team.css';
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
  faAward,
  faBookOpen,
  faBrain,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';

function Team() {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "CEO & Founder",
      bio: "Education technology expert with 15+ years of experience in online learning platforms. Passionate about making quality education accessible to everyone.",
      avatar: faGraduationCap,
      color: "#10b981",
      social: {
        linkedin: "https://linkedin.com/in/sarahjohnson",
        twitter: "https://twitter.com/sarahjohnson",
        email: "sarah@academathon.com"
      },
      achievements: [
        "PhD in Educational Technology",
        "Former VP at EdTech Solutions",
        "Published 20+ research papers"
      ],
      expertise: ["Educational Technology", "Strategic Planning", "Leadership"]
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Full-stack developer passionate about creating scalable educational technology solutions. Leads our technical vision and platform development.",
      avatar: faCode,
      color: "#3b82f6",
      social: {
        linkedin: "https://linkedin.com/in/michaelchen",
        github: "https://github.com/michaelchen",
        email: "michael@academathon.com"
      },
      achievements: [
        "10+ years in software development",
        "Former Senior Engineer at Google",
        "Open source contributor"
      ],
      expertise: ["Full-Stack Development", "Cloud Architecture", "AI/ML"]
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Education",
      bio: "Former teacher and curriculum specialist focused on student success and engagement. Ensures our platform delivers exceptional learning experiences.",
      avatar: faChalkboardTeacher,
      color: "#8b5cf6",
      social: {
        linkedin: "https://linkedin.com/in/emilyrodriguez",
        twitter: "https://twitter.com/emilyrodriguez",
        email: "emily@academathon.com"
      },
      achievements: [
        "Master's in Education",
        "15+ years teaching experience",
        "Curriculum design expert"
      ],
      expertise: ["Curriculum Design", "Pedagogy", "Student Engagement"]
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product strategist with a focus on user experience and educational outcomes. Bridges the gap between technology and learning needs.",
      avatar: faLightbulb,
      color: "#f59e0b",
      social: {
        linkedin: "https://linkedin.com/in/davidkim",
        twitter: "https://twitter.com/davidkim",
        email: "david@academathon.com"
      },
      achievements: [
        "MBA from Stanford",
        "Former Product Manager at Khan Academy",
        "UX/UI design background"
      ],
      expertise: ["Product Strategy", "User Experience", "Data Analytics"]
    },
    {
      name: "Lisa Thompson",
      role: "Head of Marketing",
      bio: "Marketing expert with a passion for education and community building. Helps students and tutors discover the power of personalized learning.",
      avatar: faRocket,
      color: "#ef4444",
      social: {
        linkedin: "https://linkedin.com/in/lisathompson",
        twitter: "https://twitter.com/lisathompson",
        email: "lisa@academathon.com"
      },
      achievements: [
        "Marketing degree from NYU",
        "Former Marketing Director at Coursera",
        "Growth hacking specialist"
      ],
      expertise: ["Digital Marketing", "Brand Strategy", "Community Building"]
    },
    {
      name: "James Wilson",
      role: "Head of Operations",
      bio: "Operations specialist ensuring smooth platform operations and excellent customer support. Committed to providing the best experience for our users.",
      avatar: faShieldAlt,
      color: "#06b6d4",
      social: {
        linkedin: "https://linkedin.com/in/jameswilson",
        email: "james@academathon.com"
      },
      achievements: [
        "Operations Management certification",
        "Former Operations Manager at Zoom",
        "Customer success expert"
      ],
      expertise: ["Operations Management", "Customer Support", "Quality Assurance"]
    }
  ];

  const advisors = [
    {
      name: "Prof. Maria Garcia",
      role: "Educational Advisor",
      bio: "Professor of Education at Harvard University, specializing in online learning and student engagement.",
      avatar: faBookOpen,
      color: "#10b981"
    },
    {
      name: "Dr. Robert Lee",
      role: "Technology Advisor",
      bio: "Former CTO of Microsoft Education, expert in educational technology and AI applications in learning.",
      avatar: faBrain,
      color: "#3b82f6"
    },
    {
      name: "Jennifer Park",
      role: "Business Advisor",
      bio: "Serial entrepreneur and investor in EdTech startups, helping us scale and grow strategically.",
      avatar: faHandshake,
      color: "#8b5cf6"
    }
  ];

  const stats = [
    { icon: faUsers, number: "50+", label: "Team Members" },
    { icon: faGlobe, number: "25+", label: "Countries Represented" },
    { icon: faGraduationCap, number: "15+", label: "Years Combined Experience" },
    { icon: faAward, number: "100+", label: "Industry Awards" }
  ];

  return (
    <div className="team-page">
      {/* Hero Section */}
      <section className="team-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Meet Our Team</h1>
            <p className="hero-subtitle">
              The passionate people behind Academathon, dedicated to transforming education through technology
            </p>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="leadership-section">
        <div className="container">
          <div className="section-header">
            <h2>Leadership Team</h2>
            <p>The visionaries leading Academathon's mission to democratize education</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-avatar" style={{ backgroundColor: member.color }}>
                  <FontAwesomeIcon icon={member.avatar} />
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

                  <div className="member-achievements">
                    <h4>Key Achievements</h4>
                    <ul>
                      {member.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex}>{achievement}</li>
                      ))}
                    </ul>
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

      {/* Advisory Board */}
      <section className="advisors-section">
        <div className="container">
          <div className="section-header">
            <h2>Advisory Board</h2>
            <p>Industry experts guiding our strategic direction</p>
          </div>
          <div className="advisors-grid">
            {advisors.map((advisor, index) => (
              <div key={index} className="advisor-card">
                <div className="advisor-avatar" style={{ backgroundColor: advisor.color }}>
                  <FontAwesomeIcon icon={advisor.avatar} />
                </div>
                <h3>{advisor.name}</h3>
                <p className="advisor-role">{advisor.role}</p>
                <p className="advisor-bio">{advisor.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="culture-section">
        <div className="container">
          <div className="section-header">
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
        <div className="container">
          <div className="join-content">
            <h2>Join Our Mission</h2>
            <p>We're always looking for passionate individuals who want to make a difference in education. Come help us build the future of learning.</p>
            <div className="join-buttons">
              <button className="btn-primary">
                <FontAwesomeIcon icon={faUserGraduate} />
                View Open Positions
              </button>
              <button className="btn-secondary">
                <FontAwesomeIcon icon={faEnvelope} />
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Team;
