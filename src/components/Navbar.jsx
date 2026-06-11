import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Activity, User } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Concept Explanations:
 * 1. Props: Receives callback functions to trigger booking, auth, and active user sessions.
 * 2. useState: Manages local UI states like `isMobileMenuOpen` and `isScrolled`.
 */
const Navbar = ({ onOpenAppointment, activeUser, onOpenAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDashboardClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/profile');
  };

  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">

        {/* Hospital Brand Logo */}
        <div className="navbar-logo" onClick={handleHomeClick}>
          <div className="logo-badge">
            <Activity className="logo-icon animate-pulse" size={26} />
          </div>
          <span className="logo-text">MedCare</span>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li><button onClick={handleHomeClick} className={`nav-item ${isHome ? 'active-nav' : ''}`}>Home</button></li>
          <li><button onClick={() => handleNavClick('about')} className="nav-item">About</button></li>
          <li><button onClick={() => handleNavClick('services')} className="nav-item">Services</button></li>
          <li><button onClick={() => handleNavClick('why-choose-us')} className="nav-item">Why Us</button></li>
          <li><button onClick={() => handleNavClick('doctors')} className="nav-item">Doctors</button></li>
          <li><button onClick={() => handleNavClick('contact')} className="nav-item">Contact</button></li>
          {activeUser && (
            <li>
              <button 
                onClick={handleDashboardClick} 
                className={`nav-item ${isProfile ? 'active-nav' : ''}`}
              >
                Dashboard
              </button>
            </li>
          )}
        </ul>

        {/* Action Buttons (Desktop) */}
        <div className="nav-actions">
          {activeUser ? (
            <button 
              className={`user-profile-pill ${isProfile ? 'active-pill' : ''}`} 
              onClick={handleDashboardClick} 
              aria-label="Open User Profile"
            >
              <div className="avatar-circle">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="profile-pill-name">Hi, {activeUser.name.split(' ')[0]}</span>
            </button>
          ) : (
            <>
              <button className="btn-signin" onClick={() => onOpenAuth('login')}>
                Sign In
              </button>
              <button className="btn-register-outline" onClick={() => onOpenAuth('signup')}>
                Register
              </button>
            </>
          )}

          <button className="btn-book-primary" onClick={onOpenAppointment}>
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
          <button onClick={handleHomeClick} className="mobile-nav-item">Home</button>
          <button onClick={() => handleNavClick('about')} className="mobile-nav-item">About</button>
          <button onClick={() => handleNavClick('services')} className="mobile-nav-item">Services</button>
          <button onClick={() => handleNavClick('why-choose-us')} className="mobile-nav-item">Why Us</button>
          <button onClick={() => handleNavClick('doctors')} className="mobile-nav-item">Doctors</button>
          <button onClick={() => handleNavClick('contact')} className="mobile-nav-item">Contact</button>
          {activeUser && (
            <button onClick={handleDashboardClick} className="mobile-nav-item">
              Dashboard
            </button>
          )}

          <div className="mobile-nav-actions">
            {activeUser ? (
              <button className="btn btn-primary w-full" onClick={handleDashboardClick}>
                <User size={16} /> My Dashboard
              </button>
            ) : (
              <div className="mobile-auth-buttons-col">
                <button className="btn btn-outline w-full" onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('login'); }}>
                  Sign In
                </button>
                <button className="btn btn-outline w-full" onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('signup'); }}>
                  Register
                </button>
              </div>
            )}
            
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
