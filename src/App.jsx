import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Doctors from './components/Doctors';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProfilePage from './components/ProfilePage';

/**
 * Main Application Component
 * 
 * Concept Explanations:
 * 1. Root Structure: App coordinates the global state and page routing.
 * 2. useState: Used to track current page ('home' or 'profile') and overlay states.
 * 3. Conditional Rendering: Swaps landing page with ProfilePage.
 */
function App() {
  // --- STATE HOOKS ---
  
  // User Authentication State
  const [activeUser, setActiveUser] = useState(() => {
    const storedActive = localStorage.getItem('medcare_active_user');
    return storedActive ? JSON.parse(storedActive) : null;
  });

  // Page Navigation State ('home' or 'profile')
  const [currentPage, setCurrentPage] = useState(() => {
    const storedActive = localStorage.getItem('medcare_active_user');
    return storedActive ? 'profile' : 'home';
  });

  // Modal toggle state variables
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // Global Appointments List State
  const [appointments, setAppointments] = useState(() => {
    return JSON.parse(localStorage.getItem('medcare_appointments') || '[]');
  });

  // Appointment Form input state variables
  const [patientName, setPatientName] = useState(() => {
    const storedActive = localStorage.getItem('medcare_active_user');
    return storedActive ? JSON.parse(storedActive).name : '';
  });
  const [patientEmail, setPatientEmail] = useState(() => {
    const storedActive = localStorage.getItem('medcare_active_user');
    return storedActive ? JSON.parse(storedActive).email : '';
  });
  const [department, setDepartment] = useState('Emergency Care');
  const [appointDate, setAppointDate] = useState('');
  const [appointTime, setAppointTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // --- EVENT HANDLERS ---
  
  // Auth handlers
  const handleAuthSuccess = (user) => {
    setActiveUser(user);
    localStorage.setItem('medcare_active_user', JSON.stringify(user));
    
    // Auto fill appointment details
    setPatientName(user.name);
    setPatientEmail(user.email);

    // Redirect to profile page dashboard
    setCurrentPage('profile');
  };

  const handleLogout = () => {
    setActiveUser(null);
    localStorage.removeItem('medcare_active_user');
    setCurrentPage('home');
    
    // Clear prefilled fields
    setPatientName('');
    setPatientEmail('');
  };

  // Open Appointment Modal & Auto Prefill
  const openAppointmentModal = () => {
    if (activeUser) {
      setPatientName(activeUser.name);
      setPatientEmail(activeUser.email);
    }
    setIsAppointmentOpen(true);
  };

  // Submit handler for booking appointments
  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API request and validate fields
    if (patientName.trim() && patientEmail.trim() && appointDate && appointTime) {
      const newAppointment = {
        id: Date.now().toString(),
        patientName,
        patientEmail,
        department,
        appointDate,
        appointTime,
        additionalNotes
      };

      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      localStorage.setItem('medcare_appointments', JSON.stringify(updatedAppointments));

      setAppointmentSuccess(true);
      console.log("Appointment Booked successfully:", newAppointment);
    }
  };

  // Reset appointment form and close modal
  const closeAppointmentModal = () => {
    setIsAppointmentOpen(false);
    // Timeout to clear success screen after closing animation
    setTimeout(() => {
      if (activeUser) {
        setPatientName(activeUser.name);
        setPatientEmail(activeUser.email);
      } else {
        setPatientName('');
        setPatientEmail('');
      }
      setDepartment('Emergency Care');
      setAppointDate('');
      setAppointTime('');
      setAdditionalNotes('');
      setAppointmentSuccess(false);
    }, 300);
  };

  return (
    <div className="app-container">
      
      {/* 1. Header Navigation Bar */}
      <Navbar 
        onOpenAppointment={openAppointmentModal} 
        activeUser={activeUser}
        onOpenAuth={(view) => { setAuthView(view); setIsAuthOpen(true); }}
        onNavigateProfile={() => setCurrentPage('profile')}
        onNavigateHome={() => setCurrentPage('home')}
        currentPage={currentPage}
      />

      {/* 2. Page Content Routing */}
      {currentPage === 'home' ? (
        <>
          {/* Landing Page Content */}
          <Hero onOpenAppointment={openAppointmentModal} />
          <About />
          <Services />
          <WhyChooseUs />
          <Doctors onOpenAppointment={openAppointmentModal} />
          <Testimonials />
          <Contact />
        </>
      ) : (
        /* Patient Profile Page Dashboard View */
        <ProfilePage 
          activeUser={activeUser}
          appointments={appointments}
          onLogout={handleLogout}
          onOpenAppointment={openAppointmentModal}
          onGoHome={() => setCurrentPage('home')}
        />
      )}

      {/* 3. Site Footer (Links, Support, & Social Networks) */}
      <Footer />


      {/* ==========================================
         INTERACTIVE OVERLAY DIALOGS (MODALS)
         ========================================== */}

      {/* A. BOOK APPOINTMENT MODAL */}
      {isAppointmentOpen && (
        <div className="modal-overlay" onClick={closeAppointmentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="modal-close-btn" onClick={closeAppointmentModal} aria-label="Close Modal">
              <X size={20} />
            </button>

            {appointmentSuccess ? (
              // Success Feedback State
              <div className="modal-success">
                <CheckCircle size={56} className="modal-success-icon" />
                <h3>Appointment Requested!</h3>
                <p>
                  Thank you, <strong>{patientName}</strong>. We have registered your request for the <strong>{department}</strong> department on <strong>{appointDate}</strong> at <strong>{appointTime}</strong>. A clinic assistant will call you to confirm.
                </p>
                <button className="btn btn-primary" onClick={closeAppointmentModal}>
                  Close Window
                </button>
              </div>
            ) : (
              // Active Booking Form State
              <>
                <div className="modal-header">
                  <h3>Schedule an Appointment</h3>
                  <p>Provide details to schedule your clinical consultation.</p>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAppointmentSubmit} className="modal-form">
                    
                    <div className="form-group">
                      <label htmlFor="modal-name">Patient Full Name <span className="req">*</span></label>
                      <input 
                        type="text" 
                        id="modal-name" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="John Doe" 
                        required 
                        disabled={activeUser ? true : false}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="modal-email">Email Address <span className="req">*</span></label>
                      <input 
                        type="email" 
                        id="modal-email" 
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="johndoe@example.com" 
                        required 
                        disabled={activeUser ? true : false}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="modal-dept">Department</label>
                      <select 
                        id="modal-dept"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="Emergency Care">Emergency Care</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dental Care">Dental Care</option>
                        <option value="ICU Departments">ICU Departments</option>
                        <option value="Radiology & Imaging">Radiology & Imaging</option>
                        <option value="Orthopedics">Orthopedics</option>
                      </select>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label htmlFor="modal-date">Date <span className="req">*</span></label>
                        <input 
                          type="date" 
                          id="modal-date" 
                          value={appointDate}
                          onChange={(e) => setAppointDate(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="modal-time">Time <span className="req">*</span></label>
                        <input 
                          type="time" 
                          id="modal-time" 
                          value={appointTime}
                          onChange={(e) => setAppointTime(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="modal-notes">Additional Symptoms / Notes</label>
                      <textarea 
                        id="modal-notes" 
                        rows="3" 
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Please describe symptoms briefly..."
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-2">
                      Request Appointment
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* B. AUTHENTICATION MODAL (LOGIN/SIGNUP) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialView={authView}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}

export default App;
