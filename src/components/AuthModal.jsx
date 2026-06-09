import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Calendar, Heart, ShieldAlert } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, initialView = 'login', onAuthSuccess }) => {
  const [view, setView] = useState(initialView); // 'login' or 'signup'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup Form States
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  
  // General UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Retrieve users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('medcare_users') || '[]');
    const user = storedUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );

    if (user) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
        // Reset fields
        setLoginEmail('');
        setLoginPassword('');
        setSuccess('');
      }, 1000);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !signupEmail || !signupPassword || !phone || !age) {
      setError('Please fill in all required fields.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('medcare_users') || '[]');
    
    // Check if email already exists
    const emailExists = storedUsers.some(
      (u) => u.email.toLowerCase() === signupEmail.toLowerCase()
    );

    if (emailExists) {
      setError('An account with this email already exists.');
      return;
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      name: fullName,
      email: signupEmail,
      password: signupPassword,
      phone,
      age: parseInt(age, 10),
      gender,
      bloodGroup,
    };

    // Save to localStorage
    storedUsers.push(newUser);
    localStorage.setItem('medcare_users', JSON.stringify(storedUsers));

    setSuccess('Registration successful! Logging you in...');
    setTimeout(() => {
      onAuthSuccess(newUser);
      onClose();
      // Reset fields
      setFullName('');
      setSignupEmail('');
      setSignupPassword('');
      setPhone('');
      setAge('');
      setGender('Male');
      setBloodGroup('O+');
      setSuccess('');
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Auth Modal">
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${view === 'login' ? 'active' : ''}`}
              onClick={() => { setView('login'); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${view === 'signup' ? 'active' : ''}`}
              onClick={() => { setView('signup'); setError(''); }}
            >
              Register
            </button>
          </div>
        </div>

        <div className="modal-body auth-modal-body">
          {error && (
            <div className="form-error-banner">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-success-banner">
              <span>{success}</span>
            </div>
          )}

          {view === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address <span className="req">*</span></label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="login-email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password <span className="req">*</span></label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="login-password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Sign In to Account
              </button>
              
              <p className="auth-switch-prompt">
                Don't have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setView('signup')}>
                  Register now
                </button>
              </p>
            </form>
          ) : (
            /* ================= SIGNUP FORM ================= */
            <form onSubmit={handleSignupSubmit} className="modal-form scrollable-form">
              <div className="form-group">
                <label htmlFor="signup-name">Full Name <span className="req">*</span></label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="signup-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">Email Address <span className="req">*</span></label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="signup-email"
                    placeholder="john@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">Create Password <span className="req">*</span></label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="signup-password"
                    placeholder="Must be secure"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="signup-phone">Phone Number <span className="req">*</span></label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      id="signup-phone"
                      placeholder="e.g. +1 234 567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-age">Age <span className="req">*</span></label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon" />
                    <input
                      type="number"
                      id="signup-age"
                      placeholder="Age"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="signup-gender">Gender</label>
                  <select
                    id="signup-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-blood">Blood Group</label>
                  <div className="input-with-icon">
                    <Heart size={16} className="input-icon" />
                    <select
                      id="signup-blood"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Create Account
              </button>

              <p className="auth-switch-prompt">
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setView('login')}>
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
