import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, PhoneCall } from 'lucide-react';

/**
 * Footer Component
 * 
 * Concept Explanations:
 * 1. Clean Layout Structure: Organizes static links and company metadata into readable footer columns.
 * 2. Accessibility: Employs correct semantic HTML elements (<footer>, <address>, etc.) for screen readers.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollToTop = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-section">
      <div className="container footer-container">
        
        {/* Column 1: Hospital Logo and Short Bio */}
        <div className="footer-column brand-column">
          <div className="footer-logo" onClick={handleScrollToTop}>
            <Activity className="logo-icon" size={26} />
            <span className="logo-text">MedCare</span>
          </div>
          <p className="footer-brand-desc">
            MedCare Health Group is committed to providing outstanding, accessible medical treatments, utilizing advanced systems and world-class specialists.
          </p>
          <div className="social-links-row">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li><button onClick={handleScrollToTop} className="footer-link-btn">Home</button></li>
            <li><button onClick={() => handleScrollToSection('about')} className="footer-link-btn">About Hospital</button></li>
            <li><button onClick={() => handleScrollToSection('services')} className="footer-link-btn">Departments</button></li>
            <li><button onClick={() => handleScrollToSection('why-choose-us')} className="footer-link-btn">Why Choose Us</button></li>
            <li><button onClick={() => handleScrollToSection('doctors')} className="footer-link-btn">Our Specialists</button></li>
            <li><button onClick={() => handleScrollToSection('contact')} className="footer-link-btn">Contact Us</button></li>
          </ul>
        </div>

        {/* Column 3: Medical Services Quicklist */}
        <div className="footer-column">
          <h4 className="footer-title">Departments</h4>
          <ul className="footer-links-list">
            <li><a href="#services" className="footer-link-btn">Cardiology Center</a></li>
            <li><a href="#services" className="footer-link-btn">Neurological Clinic</a></li>
            <li><a href="#services" className="footer-link-btn">Orthopedics & Joint Care</a></li>
            <li><a href="#services" className="footer-link-btn">Radiology & CT Scan</a></li>
            <li><a href="#services" className="footer-link-btn">Pediatrics Care</a></li>
            <li><a href="#services" className="footer-link-btn">Dental Surgery</a></li>
          </ul>
        </div>

        {/* Column 4: Contact details & Emergency */}
        <div className="footer-column contact-column">
          <h4 className="footer-title">Support Desk</h4>
          <address className="footer-address">
            <p>78, Okhla Industrial Area, Phase-III</p>
            <p>New Delhi, Delhi 110020</p>
            <p className="mt-2">Phone: <a href="tel:18008892555">1800-889-2555</a></p>
            <p>Email: <a href="mailto:support@medcare.com">support@medcare.com</a></p>
          </address>
          
          <div className="footer-emergency-banner">
            <PhoneCall size={16} className="emergency-icon-pulse" />
            <div>
              <span>Emergency 24/7 Hotline:</span>
              <a href="tel:18008899111" className="emergency-number">1800-889-9111</a>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Banner */}
      <div className="footer-bottom-banner">
        <div className="container footer-bottom-container">
          <p className="copyright-text">
            &copy; {currentYear} MedCare Hospital. All Rights Reserved. Designed for beginners.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy" className="legal-link">Privacy Policy</a>
            <span className="bullet-dot">&bull;</span>
            <a href="#terms" className="legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
