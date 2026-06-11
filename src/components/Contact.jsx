import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Contact Component
 * 
 * Concept Explanations:
 * 1. State Binding: Uses `useState` to store values for form inputs. The input changes trigger `onChange` to update state.
 * 2. Conditional Rendering: Renders a "Thank you" panel once `isSubmitted` becomes true, hiding the raw form.
 */
const Contact = () => {
  // state hooks for inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  
  // feedback status states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // form submit handler
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent full page refresh
    
    // simple client side verification
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setErrorMsg('');
    setIsSubmitted(true);
    
    // log dummy submittal parameters
    console.log("Contact form submitted:", { name, email, subject, message });
  };

  // reset form utility
  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('General Inquiry');
    setMessage('');
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="contact-section section-padding">
      <div className="container contact-container">
        
        {/* Left Side: Contact Information Cards */}
        <div className="contact-info-panel">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Get In Touch</span>
            <h2 className="section-title">Contact Information</h2>
            <div className="title-bar"></div>
          </div>
          
          <p className="contact-lead-text">
            Have questions about our treatments, specialist availability, or insurance coverage? Get in touch with our front desk.
          </p>

          <div className="contact-cards-stack">
            
            {/* Emergency Support Card */}
            <div className="contact-info-card emergency-card-glow">
              <div className="contact-card-icon red-bg">
                <Phone size={22} />
              </div>
              <div className="contact-card-details">
                <span className="card-label">24/7 Emergency Line</span>
                <a href="tel:18008899111" className="card-value font-highlight">1800-889-9111</a>
                <p className="card-desc">Call this number for instant dispatch services.</p>
              </div>
            </div>

            {/* General Consulting Phone Card */}
            <div className="contact-info-card">
              <div className="contact-card-icon blue-bg">
                <Phone size={22} />
              </div>
              <div className="contact-card-details">
                <span className="card-label">General Enquiries</span>
                <a href="tel:18008892555" className="card-value">1800-889-2555</a>
                <p className="card-desc">For booking questions & clinical rosters.</p>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="contact-info-card">
              <div className="contact-card-icon blue-bg">
                <Mail size={22} />
              </div>
              <div className="contact-card-details">
                <span className="card-label">Email Support</span>
                <a href="mailto:support@medcare.com" className="card-value">support@medcare.com</a>
                <p className="card-desc">Response within 24 business hours.</p>
              </div>
            </div>

            {/* Clinic Address Card */}
            <div className="contact-info-card">
              <div className="contact-card-icon blue-bg">
                <MapPin size={22} />
              </div>
              <div className="contact-card-details">
                <span className="card-label">Hospital Location</span>
                <span className="card-value text-base">78, Okhla Industrial Area, Phase-III, New Delhi, Delhi 110020</span>
                <p className="card-desc">Ample underground patient parking available.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Working Contact Form */}
        <div className="contact-form-panel">
          {isSubmitted ? (
            // Success Feedback State
            <div className="contact-success-state">
              <CheckCircle size={60} className="success-checkmark" />
              <h3>Message Sent Successfully!</h3>
              <p>
                Thank you for reaching out to MedCare, <strong>{name}</strong>. Our administrative team will review your inquiry and reply to <strong>{email}</strong> shortly.
              </p>
              <button className="btn btn-outline" onClick={handleReset}>
                Send Another Message
              </button>
            </div>
          ) : (
            // Active Form State
            <form onSubmit={handleSubmit} className="contact-form">
              <h3>Send Us a Message</h3>
              <p className="form-subtext">Fill out this quick form and our support desk will contact you.</p>
              
              {/* Form Validation Errors */}
              {errorMsg && (
                <div className="form-error-banner">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group-row">
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amit Sharma"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address <span className="req">*</span></label>
                  <input
                    type="email"
                    id="contact-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amit.sharma@example.com"
                    required
                  />
                </div>
              </div>

              {/* Inquiry Subject Dropdown */}
              <div className="form-group">
                <label htmlFor="contact-subject">Inquiry Subject</label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Appointment Support">Appointment Support</option>
                  <option value="Billing & Insurance">Billing & Insurance</option>
                  <option value="Feedback / Grievance">Feedback / Grievance</option>
                </select>
              </div>

              {/* Message Textarea */}
              <div className="form-group">
                <label htmlFor="contact-message">Your Message <span className="req">*</span></label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  rows="5"
                  required
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-full submit-btn">
                <Send size={18} />
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};

export default Contact;
