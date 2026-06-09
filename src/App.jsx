import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import './App.css';

// Import newly created components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import Doctors from './components/Doctors';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

/**
 * Main Application Component
 * 
 * Concept Explanations:
 * 1. Root Structure: App coordinates the global state and assemblies the grid system.
 * 2. useState: Used to track overlay states: `isAppointmentOpen` and `isLoginOpen` to toggle dialogs.
 * 3. Conditional Rendering: Uses `{condition && <JSX />}` to display interactive modal overlays when requested.
 */
function App() {
  // --- STATE HOOKS ---
  // Modal toggle state variables
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  // Appointment Form input state variables
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [department, setDepartment] = useState('Emergency Care');
  const [appointDate, setAppointDate] = useState('');
  const [appointTime, setAppointTime] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // --- EVENT HANDLERS ---
  
  // Submit handler for booking appointments
  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API request and validate fields
    if (patientName.trim() && patientEmail.trim() && appointDate && appointTime) {
      setAppointmentSuccess(true);
      console.log("Appointment Booked successfully:", {
        patientName,
        patientEmail,
        department,
        appointDate,
        appointTime,
        additionalNotes
      });
    }
  };

  // Reset appointment form and close modal
  const closeAppointmentModal = () => {
    setIsAppointmentOpen(false);
    // Timeout to clear success screen after closing animation
    setTimeout(() => {
      setPatientName('');
      setPatientEmail('');
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
        onOpenAppointment={() => setIsAppointmentOpen(true)} 
      />

      {/* 2. Hero Section (Welcome + CTAs) */}
      <Hero onOpenAppointment={() => setIsAppointmentOpen(true)} />

      {/* 3. About Us Section (Hospital Bio & Statistics) */}
      <About />

      {/* 4. Services Grid (Clinical Departments) */}
      <Services />

      {/* 5. Why Choose Us Section (Hospital Advantages) */}
      <WhyChooseUs />

      {/* 6. Qualified Specialist Doctors (Dynamic Props Demonstration) */}
      <Doctors onOpenAppointment={() => setIsAppointmentOpen(true)} />

      {/* 7. Patient Testimonials (Reviews & Social Proof) */}
      <Testimonials />

      {/* 8. Contact Information & Interactive Message Form */}
      <Contact />

      {/* 9. Site Footer (Links, Support, & Social Networks) */}
      <Footer />


      {/* ==========================================
         INTERACTIVE OVERLAY DIALOGS (MODALS)
         ========================================== */}

      {/* A. BOOK APPOINTMENT MODAL */}
      {isAppointmentOpen && (
        <div className="modal-overlay" onClick={closeAppointmentModal}>
          {/* Stop propagation so clicking inside the modal content doesn't close it */}
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



    </div>
  );
}

export default App;
