import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Activity, Heart, Sparkles 
} from 'lucide-react';
import './AuthModal.css';
import doctorImg from '../assets/hero_doctor.png';
import Login from './Login';
import Signup from './Signup';

const AuthModal = ({ isOpen, onClose, initialView = 'login', onAuthSuccess }) => {
  const [view, setView] = useState(initialView);
  const [role, setRole] = useState(null); // 'patient' | 'doctor' | null

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setRole(null);
    }
  }, [initialView, isOpen]);

  if (!isOpen) return null;

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
                  onClick={() => { setView(v); setRole(null); }}
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
                  <div className="role-flip-card" onClick={() => setRole('patient')}>
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
                  <div className="role-flip-card" onClick={() => setRole('doctor')}>
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
                {view === 'login' ? (
                  <Login role={role} onAuthSuccess={onAuthSuccess} onClose={onClose} />
                ) : (
                  <Signup role={role} onAuthSuccess={onAuthSuccess} onClose={onClose} />
                )}

                <div className="auth-form-back">
                  <button type="button" className="auth-back-btn" onClick={() => setRole(null)}>Change Role</button>
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
