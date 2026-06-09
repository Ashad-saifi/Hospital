import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Concept Explanations:
 * 1. Props: Receives function `onOpenAppointment` to interact with parent state.
 * 2. useState: Manages local UI states like `isMobileMenuOpen` (mobile menu dropdown) and `isScrolled` (header background style change).
 */
const Navbar = ({ onOpenAppointment }) => {
  // state variable to track if mobile hamburger menu is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // state variable to track if user has scrolled down the page (for styling)
  const [isScrolled, setIsScrolled] = useState(false);

  // listen to page scroll events to add background styling to the navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // clean up event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // helper function to close mobile menu and scroll to a specific section
  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        {/* Hospital Brand Logo */}
        <div className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Activity className="logo-icon" size={28} />
          <span className="logo-text">MedCare</span>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-item">Home</button></li>
          <li><button onClick={() => handleNavClick('about')} className="nav-item">About</button></li>
          <li><button onClick={() => handleNavClick('services')} className="nav-item">Services</button></li>
          <li><button onClick={() => handleNavClick('why-choose-us')} className="nav-item">Why Us</button></li>
          <li><button onClick={() => handleNavClick('doctors')} className="nav-item">Doctors</button></li>
          <li><button onClick={() => handleNavClick('contact')} className="nav-item">Contact</button></li>
        </ul>

        {/* Action Buttons (Desktop) */}
        <div className="nav-actions">
          <button className="btn btn-primary" onClick={onOpenAppointment}>
            Book Appointment
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          <button onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mobile-nav-item">Home</button>
          <button onClick={() => handleNavClick('about')} className="mobile-nav-item">About</button>
          <button onClick={() => handleNavClick('services')} className="mobile-nav-item">Services</button>
          <button onClick={() => handleNavClick('why-choose-us')} className="mobile-nav-item">Why Us</button>
          <button onClick={() => handleNavClick('doctors')} className="mobile-nav-item">Doctors</button>
          <button onClick={() => handleNavClick('contact')} className="mobile-nav-item">Contact</button>
          
          <div className="mobile-nav-actions">
            <button className="btn btn-primary w-full" onClick={() => { setIsMobileMenuOpen(false); onOpenAppointment(); }}>
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
