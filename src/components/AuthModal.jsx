import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, Phone, Calendar, Heart, Eye, EyeOff, 
  ShieldCheck, Activity, Loader2, Sparkles 
} from 'lucide-react';
import './AuthModal.css';
import doctorImg from '../assets/hero_doctor.png';

// Import our API helper functions
import { apiLogin, apiSignup } from '../utils/api';

const FormField = ({ label, id, icon: Icon, required = true, children }) => (
  <div className="auth-field-group">
    <label htmlFor={id}>{label} {required && <span className="req">*</span>}</label>
    <div className="auth-input-container">
      {Icon && <Icon size={16} className="input-icon" />}
      {children}
    </div>
  </div>
);

const FormInput = ({ label, id, icon, type = "text", placeholder, value, onChange, required = true, disabled, children, ...props }) => (
  <FormField label={label} id={id} icon={icon} required={required}>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      {...props}
    />
    {children}
  </FormField>
);

const FormSelect = ({ label, id, icon, value, onChange, disabled, options }) => (
  <FormField label={label} id={id} icon={icon} required={false}>
    <select id={id} name={id} value={value} onChange={onChange} disabled={disabled}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </FormField>
);

const AuthModal = ({ isOpen, onClose, initialView = 'login', onAuthSuccess }) => {
  const [view, setView] = useState(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(null); // 'patient' | 'doctor' | null
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState = {
    email: '', password: '', confirmPassword: '', name: '', phone: '', age: '', gender: 'Male', bloodGroup: 'O+'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setIsLoading(false);
      setFormData(initialFormState);
      setRole(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [initialView, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const isLogin = view === 'login';

    try {
      if (isLogin) {
        const userResponse = await apiLogin(formData.email, formData.password);
        onAuthSuccess(userResponse);
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const newUserPayload = {
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          phone: formData.phone,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          role: role || 'patient'
        };

        const userResponse = await apiSignup(newUserPayload);
        onAuthSuccess(userResponse);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your network and credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBtn = (show, setter) => (
    <button type="button" className="password-toggle-btn" onClick={() => setter(!show)}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close Modal"><X size={18} /></button>

        <div className="auth-modal-left">
          <div className="auth-left-glow"></div>
          <div className="auth-brand-section">
            <div className="auth-brand-logo"><Activity size={22} className="animate-pulse" /></div>
            <span className="auth-brand-name">MedCare</span>
          </div>
          <div className="auth-welcome-message">
            <h2>Your Health, Our Priority.</h2>
            <p>Access specialized healthcare, schedule clinical sessions, and manage your health passport in one secure dashboard.</p>
          </div>
          <div className="auth-floating-badges">
            <img src={doctorImg} alt="Medical Team Support" className="auth-doctor-silhouette" />
            {[
              { icon: Sparkles, color: '#fbbf24', text: '50+ Doctors', cls: 'f-badge-1' },
              { icon: ShieldCheck, color: '#34d399', text: 'HIPAA Secured', cls: 'f-badge-2' },
              { icon: Heart, color: '#f87171', text: '24/7 Care', cls: 'f-badge-3' }
            ].map(({ icon: Icon, color, text, cls }, i) => (
              <div key={i} className={`floating-icon-card ${cls}`}>
                <Icon size={14} style={{ color }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="auth-left-footer">
            <div className="auth-trust-badge"><ShieldCheck size={16} /><span>100% Secure & Privacy Encrypted</span></div>
            <span className="auth-left-hotline">Emergency Helpline: 1800-889-2555</span>
          </div>
        </div>

        <div className="auth-modal-right">
          <div className="auth-tabs-container">
            <div className="auth-tabs-row">
              {['login', 'signup'].map(v => (
                <button
                  key={v}
                  className={`auth-tab-select ${view === v ? 'active' : ''}`}
                  onClick={() => { setView(v); setError(''); setRole(null); }}
                  disabled={isLoading}
                >
                  {v === 'login' ? 'Login' : 'Signup'}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-form-wrapper">
            {!role ? (
              <div className="role-selection-panel">
                <h3 className="role-title">Are you a Patient or a Doctor?</h3>
                
                <div className="role-flip-cards-container">
                  {/* Patient Card */}
                  <div className="role-flip-card" onClick={() => { setRole('patient'); setError(''); }}>
                    <div className="role-flip-card-inner">
                      <div className="role-flip-card-front patient-front">
                        <div className="role-emoji-bg">
                          <span className="role-card-emoji">🤕</span>
                        </div>
                        <div className="role-card-front-label">Patient</div>
                      </div>
                      <div className="role-flip-card-back patient-back">
                        <div className="role-card-back-content">
                          <Heart size={28} className="role-card-icon" />
                          <h4>Patient Portal</h4>
                          <p>Book visits, view prescriptions & check daily pillbox tracker</p>
                          <span className="role-action-badge">Access Portal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Card */}
                  <div className="role-flip-card" onClick={() => { setRole('doctor'); setError(''); }}>
                    <div className="role-flip-card-inner">
                      <div className="role-flip-card-front doctor-front">
                        <div className="role-emoji-bg">
                          <span className="role-card-emoji">👨‍⚕️</span>
                        </div>
                        <div className="role-card-front-label">Doctor</div>
                      </div>
                      <div className="role-flip-card-back doctor-back">
                        <div className="role-card-back-content">
                          <Activity size={28} className="role-card-icon" />
                          <h4>Clinical Portal</h4>
                          <p>Manage appointments, view patients & track practice analytics</p>
                          <span className="role-action-badge">Access Portal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="role-note">Choose one to continue to {view === 'login' ? 'Login' : 'Signup'}.</p>
              </div>
            ) : (
              <>
                {error && <div className="form-error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

                {view === 'login' ? (
                  <form onSubmit={handleSubmit} className="auth-form-column">
                    <FormInput label="Email Address" id="email" icon={Mail} type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} />
                    <FormInput label="Password" id="password" icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={formData.password} onChange={handleChange} disabled={isLoading}>
                      {toggleBtn(showPassword, setShowPassword)}
                    </FormInput>
                    <div className="auth-form-helpers">
                      <button type="button" className="auth-forgot-link" onClick={() => alert('Password reset link sent to your email.')}>Forgot Password?</button>
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                      {isLoading ? <><Loader2 size={18} className="spinner-icon" /> Authenticating...</> : 'Login to Dashboard'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="auth-form-column scrollable-form">
                    <FormInput label="Full Name" id="name" icon={User} placeholder="Amit Sharma" value={formData.name} onChange={handleChange} disabled={isLoading} />
                    <FormInput label="Email Address" id="email" icon={Mail} type="email" placeholder="amit@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} />
                    <FormInput label="Create Password" id="password" icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Must be secure" value={formData.password} onChange={handleChange} disabled={isLoading}>
                      {toggleBtn(showPassword, setShowPassword)}
                    </FormInput>
                    <FormInput label="Confirm Password" id="confirmPassword" icon={Lock} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading}>
                      {toggleBtn(showConfirmPassword, setShowConfirmPassword)}
                    </FormInput>
                    <div className="form-group-row">
                      <FormInput label="Phone Number" id="phone" icon={Phone} type="tel" placeholder="e.g. +1 234 567" value={formData.phone} onChange={handleChange} disabled={isLoading} />
                      <FormInput label="Age" id="age" icon={Calendar} type="number" placeholder="Age" min="1" max="120" value={formData.age} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div className="form-group-row">
                      <FormSelect label="Gender" id="gender" icon={User} value={formData.gender} onChange={handleChange} disabled={isLoading} options={['Male', 'Female', 'Other']} />
                      <FormSelect label="Blood Group" id="bloodGroup" icon={Heart} value={formData.bloodGroup} onChange={handleChange} disabled={isLoading} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                      {isLoading ? <><Loader2 size={18} className="spinner-icon" /> Creating Account...</> : 'Signup Account'}
                    </button>
                  </form>
                )}

                <div className="auth-form-back">
                  <button type="button" className="auth-back-btn" onClick={() => setRole(null)} disabled={isLoading}>Change Role</button>
                </div>
              </>
            )}

            <div className="auth-right-footer-note">
              <div className="auth-security-indicator"><ShieldCheck size={14} /><span>Secure HIPAA Compliant Login</span></div>
              <p className="auth-hipaa-text">Your credentials are encrypted. By accessing this portal, you agree to our patient confidentiality terms.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
