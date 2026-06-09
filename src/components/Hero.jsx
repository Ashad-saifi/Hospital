import React from 'react';
import { Calendar, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import heroImage from '../assets/hero_doctor.png';

/**
 * Hero Component
 * 
 * Concept Explanations:
 * 1. Props: Receives `onOpenAppointment` to trigger the booking modal when the main CTA is clicked.
 * 2. Assets: Imports the local generated `hero_doctor.png` asset for high quality layout.
 */
const Hero = ({ onOpenAppointment }) => {
  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="container hero-container">
        
        {/* Left Side: Copy and CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} className="badge-icon" />
            <span>100% Trusted Healthcare Partner</span>
          </div>
          
          <h1 className="hero-title">
            Your Health Is Our <span className="highlight">Top Priority</span>
          </h1>
          
          <p className="hero-description">
            Welcome to MedCare, where state-of-the-art medical technology meets compassionate expert care. We are committed to providing personalized treatments and 24/7 support for you and your family.
          </p>
          
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onOpenAppointment}>
              <Calendar size={20} />
              Book Appointment
            </button>
            <button className="btn btn-outline btn-lg" onClick={handleScrollToAbout}>
              Learn More
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick trust items */}
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <span className="trust-number">24/7</span>
              <span className="trust-label">Emergency Support</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">50+</span>
              <span className="trust-label">Expert Doctors</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">15k+</span>
              <span className="trust-label">Happy Patients</span>
            </div>
          </div>
        </div>

        {/* Right Side: Image and Floating Badges */}
        <div className="hero-media">
          <div className="image-wrapper">
            <img 
              src={heroImage} 
              alt="MedCare Doctors" 
              className="hero-img" 
            />
            <div className="image-glow"></div>
          </div>

          {/* Premium Floating Card 1 */}
          <div className="floating-card float-left-top">
            <div className="floating-icon">
              <HeartPulse size={24} />
            </div>
            <div>
              <h4>Active Care</h4>
              <p>Live Patient Monitoring</p>
            </div>
          </div>

          {/* Premium Floating Card 2 */}
          <div className="floating-card float-right-bottom">
            <span className="badge-pulse"></span>
            <div>
              <h4>Emergency Available</h4>
              <p>Response time &lt; 8 mins</p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;
