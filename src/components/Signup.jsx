import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Calendar, Heart, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormInput, FormSelect } from './FormControls';
import { apiSignup } from '../utils/api';
import './AuthModal.css';

const Signup = ({ role, onAuthSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const newUserPayload = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        phone: formData.phone,
        age: parseInt(formData.age, 10) || 0,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        role: role || 'doctor'
      };

      const userResponse = await apiSignup(newUserPayload);
      onAuthSuccess(userResponse);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
    <div className="auth-form-wrapper">
      {error && <div className="form-error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form-column scrollable-form">
        <FormInput 
          label="Full Name" 
          id="name" 
          icon={User} 
          placeholder="Amit Sharma" 
          value={formData.name} 
          onChange={handleChange} 
          disabled={isLoading} 
        />
        <FormInput 
          label="Email Address" 
          id="email" 
          icon={Mail} 
          type="email" 
          placeholder="amit@example.com" 
          value={formData.email} 
          onChange={handleChange} 
          disabled={isLoading} 
        />
        <FormInput 
          label="Create Password" 
          id="password" 
          icon={Lock} 
          type={showPassword ? 'text' : 'password'} 
          placeholder="Must be secure" 
          value={formData.password} 
          onChange={handleChange} 
          disabled={isLoading}
        >
          {toggleBtn(showPassword, setShowPassword)}
        </FormInput>
        <FormInput 
          label="Confirm Password" 
          id="confirmPassword" 
          icon={Lock} 
          type={showConfirmPassword ? 'text' : 'password'} 
          placeholder="Confirm your password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          disabled={isLoading}
        >
          {toggleBtn(showConfirmPassword, setShowConfirmPassword)}
        </FormInput>
        <div className="form-group-row">
          <FormInput 
            label="Phone Number" 
            id="phone" 
            icon={Phone} 
            type="tel" 
            placeholder="e.g. +91 98765 43210" 
            value={formData.phone} 
            onChange={handleChange} 
            disabled={isLoading} 
          />
          <FormInput 
            label="Age" 
            id="age" 
            icon={Calendar} 
            type="number" 
            placeholder="Age" 
            min="1" 
            max="120" 
            value={formData.age} 
            onChange={handleChange} 
            disabled={isLoading} 
          />
        </div>
        <div className="form-group-row">
          <FormSelect 
            label="Gender" 
            id="gender" 
            icon={User} 
            value={formData.gender} 
            onChange={handleChange} 
            disabled={isLoading} 
            options={['Male', 'Female', 'Other']} 
          />
          <FormSelect 
            label="Blood Group" 
            id="bloodGroup" 
            icon={Heart} 
            value={formData.bloodGroup} 
            onChange={handleChange} 
            disabled={isLoading} 
            options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} 
          />
        </div>
        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? <><Loader2 size={18} className="spinner-icon" /> Creating Account...</> : 'Signup Account'}
        </button>
      </form>
    </div>
  );
};

export default Signup;
