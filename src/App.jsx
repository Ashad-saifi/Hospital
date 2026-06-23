import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

import { 
  apiGetAppointments, 
  apiBookAppointment, 
  apiCancelAppointment, 
  apiUpdateProfile,
  apiGetDoctors,
  apiUpdateAppointmentStatus,
  apiUpdateDoctorProfile
} from './utils/api';

/**
 * Main Application Component
 * 
 * Concept Explanations:
 * 1. Root Structure: App coordinates the global state and page routing.
 * 2. useState: Used to track current page ('home' or 'profile') and overlay states.
 * 3. Conditional Rendering: Swaps landing page with ProfilePage.
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggingOutRef = useRef(false);

  // --- STATE HOOKS ---
  
  // User Authentication State
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const storedActive = localStorage.getItem('medcare_active_user');
      return storedActive ? JSON.parse(storedActive) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      return null;
    }
  });

  // Modal toggle state variables
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // Global Appointments List State
  // We start with an empty array. The list will be filled by fetching from the backend.
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // Appointment Form input state variables
  const [patientName, setPatientName] = useState(() => {
    try {
      const storedActive = localStorage.getItem('medcare_active_user');
      return storedActive ? JSON.parse(storedActive)?.name || '' : '';
    } catch (err) {
      return '';
    }
  });
  const [patientEmail, setPatientEmail] = useState(() => {
    try {
      const storedActive = localStorage.getItem('medcare_active_user');
      return storedActive ? JSON.parse(storedActive)?.email || '' : '';
    } catch (err) {
      return '';
    }
  });
  const [department, setDepartment] = useState('Emergency Care');
  const [appointDate, setAppointDate] = useState('');
  const [appointTime, setAppointTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Trigger login modal if redirected from guard
  useEffect(() => {
    if (location.state?.showLogin) {
      setAuthView('login');
      setIsAuthOpen(true);
      // Clear the state so it doesn't reopen on subsequent actions
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Reset logging out flag when landing back on the home page
  useEffect(() => {
    if (location.pathname === '/' && isLoggingOutRef.current) {
      isLoggingOutRef.current = false;
    }
  }, [location.pathname]);

  // Fetch appointments for the logged-in user from the backend API (Real-time polling)
  useEffect(() => {
    async function loadAppointments() {
      if (activeUser) {
        try {
          const userApps = await apiGetAppointments(activeUser.email);
          setAppointments(userApps);
        } catch (err) {
          console.error("Failed to load appointments from server:", err);
        }
      } else {
        setAppointments([]);
      }
    }
    loadAppointments();
    const interval = setInterval(loadAppointments, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  // Fetch doctors list from backend (Real-time polling)
  useEffect(() => {
    async function loadDoctors() {
      try {
        const data = await apiGetDoctors();
        setDoctorsList(data);
      } catch (err) {
        console.error("Failed to load doctors list:", err);
      }
    }
    loadDoctors();
    const interval = setInterval(loadDoctors, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- EVENT HANDLERS ---
  
  // Auth handlers
  const handleAuthSuccess = (user) => {
    setActiveUser(user);
    localStorage.setItem('medcare_active_user', JSON.stringify(user));
    
    // Auto fill appointment details
    setPatientName(user.name);
    setPatientEmail(user.email);

    // Redirect to profile page dashboard
    navigate('/profile');
  };

  const handleLogout = () => {
    isLoggingOutRef.current = true;
    setActiveUser(null);
    localStorage.removeItem('medcare_active_user');
    
    // Clear prefilled fields
    setPatientName('');
    setPatientEmail('');

    navigate('/', { replace: true });
  };

  // Update user profile details on the backend API
  const handleUpdateProfile = async (updatedUser) => {
    try {
      // Send a PUT request: /api/users/:id to save updated demographics
      const savedUser = await apiUpdateProfile(updatedUser.id, {
        name: updatedUser.name,
        phone: updatedUser.phone,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.bloodGroup,
        height: updatedUser.height,
        weight: updatedUser.weight,
        allergies: updatedUser.allergies,
        chronicConditions: updatedUser.chronicConditions,
        emergencyContact: updatedUser.emergencyContact,
        address: updatedUser.address
      });
      
      // Update our local active user React state and localStorage (to keep user logged in on reload)
      setActiveUser(savedUser);
      localStorage.setItem('medcare_active_user', JSON.stringify(savedUser));
      
      // Auto fill appointment fields with new name/email
      setPatientName(savedUser.name);
      setPatientEmail(savedUser.email);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to save profile changes: ' + err.message);
    }
  };

  const handleUpdateDoctorProfile = async (updatedDetails) => {
    try {
      const doctorId = activeUser.doctorDetails?.id || activeUser.id;
      const res = await apiUpdateDoctorProfile(doctorId, updatedDetails);
      
      const updatedUser = {
        ...activeUser,
        name: res.doctorDetails.name,
        email: res.doctorDetails.email,
        doctorDetails: res.doctorDetails
      };
      setActiveUser(updatedUser);
      localStorage.setItem('medcare_active_user', JSON.stringify(updatedUser));
      
      // Refresh doctors list
      const data = await apiGetDoctors();
      setDoctorsList(data);
    } catch (err) {
      console.error("Failed to update doctor profile:", err);
      alert("Update failed: " + err.message);
    }
  };

  // Open Appointment Modal & Auto Prefill
  const openAppointmentModal = async (doctorObjOrId) => {
    try {
      const data = await apiGetDoctors();
      setDoctorsList(data);
    } catch (err) {
      console.error("Failed to refresh doctors list:", err);
    }

    if (activeUser) {
      setPatientName(activeUser.name);
      setPatientEmail(activeUser.email);
      if (doctorObjOrId) {
        const docId = typeof doctorObjOrId === 'string' ? doctorObjOrId : (doctorObjOrId._id || doctorObjOrId.id);
        setSelectedDoctorId(docId);
        if (doctorObjOrId.specialty) {
          setDepartment(doctorObjOrId.specialty);
        }
      } else {
        setSelectedDoctorId('');
      }
      setIsAppointmentOpen(true);
    } else {
      setAuthView('login');
      setIsAuthOpen(true);
    }
  };

  // Submit handler for booking appointments via backend API
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    if (patientName.trim() && patientEmail.trim() && appointDate && appointTime) {
      const appData = {
        patientName,
        patientEmail: patientEmail.toLowerCase(),
        department,
        appointDate,
        appointTime,
        additionalNotes,
        doctorId: selectedDoctorId
      };

      try {
        // Send a POST request to server: /api/appointments
        const responseApp = await apiBookAppointment(appData);
        
        // Fetch the updated list of appointments from the backend for this patient
        const updatedApps = await apiGetAppointments(activeUser.email);
        setAppointments(updatedApps);
        setAppointmentSuccess(true);
        console.log("Appointment Booked successfully on backend:", responseApp);
      } catch (err) {
        console.error("Failed to book appointment on server:", err);
        alert("Booking failed: " + err.message);
      }
    }
  };

  // Update appointment status (Confirm/Reject)
  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await apiUpdateAppointmentStatus(appointmentId, status);
      // Refresh list
      const updatedApps = await apiGetAppointments(activeUser.email);
      setAppointments(updatedApps);
      console.log(`Appointment ${appointmentId} status updated to ${status}`);
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  // Cancel an appointment via backend API
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        // Send a DELETE request to server: /api/appointments/:id
        await apiCancelAppointment(appointmentId);
        
        // Refresh the appointments list from backend
        const updatedApps = await apiGetAppointments(activeUser.email);
        setAppointments(updatedApps);
        console.log("Appointment cancelled successfully on backend:", appointmentId);
      } catch (err) {
        console.error("Failed to cancel appointment on server:", err);
        alert("Cancellation failed: " + err.message);
      }
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
      setSelectedDoctorId('');
      setAppointDate('');
      setAppointTime('');
      setAdditionalNotes('');
      setAppointmentSuccess(false);
    }, 300);
  };

  const selectedDoctorObj = doctorsList.find(doc => (doc._id || doc.id) === selectedDoctorId);
  const isSelectedDoctorOnline = selectedDoctorObj 
    ? (selectedDoctorObj.isOnline === true || selectedDoctorObj.isOnline === 'true' || selectedDoctorObj.isOnline === undefined) 
    : true;
  const recommendedDoctors = selectedDoctorObj && !isSelectedDoctorOnline
    ? doctorsList.filter(doc => 
        (doc._id || doc.id) !== selectedDoctorId && 
        doc.specialty === selectedDoctorObj.specialty && 
        (doc.isOnline === true || doc.isOnline === 'true' || doc.isOnline === undefined)
      )
    : [];

  return (
    <div className="app-container">
      
      {/* Page Content Routing */}
      <Routes>
        <Route path="/" element={
          <>
            {/* Header Navigation Bar (Home Localised) */}
            <Navbar 
              onOpenAppointment={openAppointmentModal} 
              activeUser={activeUser}
              onOpenAuth={(view) => { setAuthView(view); setIsAuthOpen(true); }}
            />
            {/* Landing Page Content */}
            <Hero onOpenAppointment={openAppointmentModal} />
            <About />
            <Services onOpenAppointment={openAppointmentModal} />
            <WhyChooseUs />
            <Doctors onOpenAppointment={openAppointmentModal} doctorsList={doctorsList} />
            <Testimonials />
            <Contact />
            {/* Site Footer (Home Localised) */}
            <Footer />
          </>
        } />

        <Route path="/profile" element={
          activeUser ? (
            /* Patient Profile Page Dashboard View (Independent Layout) */
            <ProfilePage 
              activeUser={activeUser}
              appointments={appointments}
              doctorsList={doctorsList}
              onLogout={handleLogout}
              onOpenAppointment={openAppointmentModal}
              onCancelAppointment={handleCancelAppointment}
              onUpdateProfile={handleUpdateProfile}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onUpdateDoctorProfile={handleUpdateDoctorProfile}
            />
          ) : (
            <Navigate to="/" replace state={{ showLogin: !isLoggingOutRef.current }} />
          )
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


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
                        placeholder="Amit Sharma" 
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
                        placeholder="amit.sharma@example.com" 
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
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="modal-doctor">Attending Doctor <span className="req">*</span></label>
                      <select 
                        id="modal-doctor"
                        value={selectedDoctorId}
                        onChange={(e) => {
                          setSelectedDoctorId(e.target.value);
                          const doc = doctorsList.find(d => (d._id || d.id) === e.target.value);
                          if (doc && doc.specialty) {
                            setDepartment(doc.specialty);
                          }
                        }}
                        required
                      >
                        <option value="">Select Doctor...</option>
                        {doctorsList.map(doc => {
                          const isOnline = doc.isOnline === true || doc.isOnline === 'true' || doc.isOnline === undefined;
                          return (
                            <option key={doc._id || doc.id} value={doc._id || doc.id}>
                              {doc.name} ({doc.specialty}) - {isOnline ? 'Online' : 'Offline'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedDoctorId && !isSelectedDoctorOnline && (
                      <div className="booking-offline-warning" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '16px', fontSize: '0.88rem', textAlign: 'left' }}>
                        <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '8px' }}>
                          ⚠️ {selectedDoctorObj?.name} is currently Offline. Booking is disabled.
                        </p>
                        {recommendedDoctors.length > 0 ? (
                          <div>
                            <p style={{ fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Try these available {selectedDoctorObj?.specialty} specialists instead:</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {recommendedDoctors.map(rec => (
                                <button
                                  type="button"
                                  key={rec._id || rec.id}
                                  onClick={() => {
                                    setSelectedDoctorId(rec._id || rec.id);
                                    if (rec.specialty) {
                                      setDepartment(rec.specialty);
                                    }
                                  }}
                                  style={{ padding: '6px 12px', borderRadius: '20px', border: '1.5px solid #10b981', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  {rec.name} (Online)
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: '#4b5563' }}>No other online specialists are available in this department right now.</p>
                        )}
                      </div>
                    )}

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

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full mt-2"
                      disabled={selectedDoctorId && !isSelectedDoctorOnline}
                      style={{ 
                        opacity: (selectedDoctorId && !isSelectedDoctorOnline) ? 0.5 : 1, 
                        cursor: (selectedDoctorId && !isSelectedDoctorOnline) ? 'not-allowed' : 'pointer' 
                      }}
                    >
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
