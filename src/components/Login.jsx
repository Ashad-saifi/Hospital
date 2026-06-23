import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormInput } from './FormControls';
import { apiLogin } from '../utils/api';
import './AuthModal.css';

const Login = ({ role, onAuthSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userResponse = await apiLogin(email, password);
      onAuthSuccess(userResponse);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your network and credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordBtn = () => (
    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="auth-form-wrapper">
      {error && <div className="form-error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form-column">
        <FormInput 
          label="Email Address" 
          id="email" 
          icon={Mail} 
          type="email" 
          placeholder="name@example.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading} 
        />
        <FormInput 
          label="Password" 
          id="password" 
          icon={Lock} 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Enter password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={isLoading}
        >
          {togglePasswordBtn()}
        </FormInput>
        
        <div className="auth-form-helpers">
          <button type="button" className="auth-forgot-link" onClick={() => alert('Password reset link sent to your email.')}>
            Forgot Password?
          </button>
        </div>
        
        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? <><Loader2 size={18} className="spinner-icon" /> Authenticating...</> : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default Login;
