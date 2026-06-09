import React from 'react';
import { CheckCircle2, Award, CalendarClock, ShieldCheck } from 'lucide-react';

/**
 * About Component
 * 
 * Concept Explanations:
 * 1. Functional Components: This is a stateless presentation component that showcases hospital details.
 * 2. Icon Integration: Uses 'lucide-react' icons to visually separate stats and features.
 */
const About = () => {
  // Array of hospital statistics to display dynamically
  const stats = [
    { number: "15+", label: "Years of Excellence" },
    { number: "50+", label: "Specialist Doctors" },
    { number: "15,000+", label: "Successful Surgeries" },
    { number: "99.4%", label: "Patient Satisfaction" }
  ];

  // List of hospital certifications/key highlights
  const highlights = [
    "Fully Accredited & Certified Health Care Center",
    "24/7 Fast-Response Emergency Department",
    "Modern Clinical Laboratories & Pharmacy",
    "Pioneering Medical Technology & Equipment",
    "Top-Tier Specialist Consulting Teams",
    "Comprehensive Insurance Coverages Accepted"
  ];

  return (
    <section id="about" className="about-section section-padding">
      <div className="container about-container">
        
        {/* Left Side: Stats and Experience Badges */}
        <div className="about-stats-grid">
          <div className="experience-card">
            <div className="exp-circle">
              <span className="exp-years">15+</span>
              <span className="exp-text">Years</span>
            </div>
            <h3>Saving Lives & Building Trust</h3>
            <p>MedCare has been at the forefront of medical service innovation since 2011.</p>
          </div>

          <div className="stats-cards-wrapper">
            {stats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <h4>{stat.number}</h4>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Description and Checkmarks */}
        <div className="about-content">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Who We Are</span>
            <h2 className="section-title">About MedCare Hospital</h2>
            <div className="title-bar"></div>
          </div>
          
          <p className="about-text-primary">
            MedCare is a leading multi-specialty healthcare institution dedicated to providing high-quality, patient-centric services. Our focus is on offering an integrated clinical platform that ensures fast diagnosis, effective therapy, and smooth recovery processes.
          </p>
          
          <p className="about-text-secondary">
            Our state-of-the-art facilities host dedicated wings for specialized research, intensive care units, and modern diagnostic radiology. We believe that health services should be accessible, comforting, and highly transparent.
          </p>

          {/* Highlights checklist using mapping */}
          <div className="highlights-list">
            {highlights.map((highlight, index) => (
              <div className="highlight-item" key={index}>
                <CheckCircle2 className="check-icon" size={20} />
                <span>{highlight}</span>
              </div>
            ))}
          </div>

          {/* Emergency support highlight box */}
          <div className="about-cta-box">
            <div className="cta-icon-wrapper">
              <CalendarClock size={24} />
            </div>
            <div>
              <h5>Need Urgent Care or Consulting?</h5>
              <p>Call our hotline at <strong>1-800-555-CARE</strong> for immediate guidance.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
