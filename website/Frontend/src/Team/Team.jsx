import React from 'react';
import './Team.css';
import Footer from '../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import sahilImage from '../assets/sahil.avif';

const teamMembers = [
  {
    name: 'Sahil Talati',
    role: 'Founder & CEO',
    bio: 'Sahil is pursuing Computer Science with a concentration in Big Data Systems at Wilfrid Laurier University. His passion for accessible education — paired with hands-on experience building software at scale — led him to create Academathon from scratch. He oversees product strategy, platform growth, and company direction.',
    image: sahilImage,
    initials: 'ST',
    expertise: ['Product Strategy', 'Full-Stack Engineering', 'EdTech'],
    social: {
      linkedin: 'https://www.linkedin.com/in/sahil-talati/',
      email: 'sahil@academathon.ca',
    },
  },
  {
    name: 'Ryan Tang',
    role: 'Co-Founder & CTO',
    bio: "Ryan is a Computer Science student at Wilfrid Laurier University specializing in AI. As CTO, he leads platform architecture, backend systems, and AI-powered features — building the infrastructure that makes every lesson possible. He's driven by reliable, high-performance systems that quietly make learning better.",
    initials: 'RT',
    expertise: ['Cloud Architecture', 'AI / ML', 'Backend Systems'],
    social: {
      linkedin: 'https://www.linkedin.com/in/ryan-tng/',
      github: 'https://github.com/ryan-tng',
      email: 'ryant012015@gmail.com',
    },
  },
];

export default function Team() {
  return (
    <div className="team-page">

      {/* ── Hero ── */}
      <section className="team-hero">
        <div className="team-container">
          <p className="team-eyebrow">The Founders</p>
          <h1 className="team-h1">
            Two builders with one <em>shared mission.</em>
          </h1>
          <p className="team-subtitle">
            Academathon was built in February 2021 by two university students who saw a
            gap — students struggling, and talented tutors with nowhere to connect. We fixed that.
          </p>
        </div>
      </section>

      {/* ── Founders ── */}
      <section className="team-members">
        <div className="team-container">
          <p className="team-overline">Leadership</p>
          <h2 className="team-h2">Meet the team</h2>
          <div className="team-cards">
            {teamMembers.map((member, i) => (
              <div key={i} className="founder-card">
                <div className="founder-avatar-col">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="founder-photo"
                    />
                  ) : (
                    <div className="founder-initials" aria-hidden="true">
                      {member.initials}
                    </div>
                  )}
                </div>
                <div className="founder-info">
                  <div className="founder-header">
                    <div className="founder-title-group">
                      <h3 className="founder-name">{member.name}</h3>
                      <span className="founder-role">{member.role}</span>
                    </div>
                    <div className="founder-social">
                      {member.social.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                      )}
                      {member.social.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                          aria-label={`${member.name} on GitHub`}
                        >
                          <FontAwesomeIcon icon={faGithub} />
                        </a>
                      )}
                      {member.social.email && (
                        <a
                          href={`mailto:${member.social.email}`}
                          className="social-link"
                          aria-label={`Email ${member.name}`}
                        >
                          <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="founder-bio">{member.bio}</p>
                  <div className="founder-expertise">
                    {member.expertise.map((tag, j) => (
                      <span key={j} className="expertise-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="team-cta">
        <div className="team-container team-cta-inner">
          <p className="team-cta-overline">Join our community</p>
          <h2 className="team-cta-h2">Become a tutor.</h2>
          <p className="team-cta-sub">
            We're always looking for passionate university students to join our
            network. Invite-only — apply and we'll be in touch.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSf-QDRnM5yjm9n7D713aiLNlLQyTyLgvD_tIdP7VcG1RNqRrA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="team-cta-btn"
          >
            Apply as a tutor <FontAwesomeIcon icon={faArrowRight} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
