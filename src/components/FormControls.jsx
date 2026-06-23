import React from 'react';

export const FormField = ({ label, id, icon: Icon, required = true, children }) => (
  <div className="auth-field-group">
    <label htmlFor={id}>{label} {required && <span className="req">*</span>}</label>
    <div className="auth-input-container">
      {Icon && <Icon size={16} className="input-icon" />}
      {children}
    </div>
  </div>
);

export const FormInput = ({ label, id, icon, type = "text", placeholder, value, onChange, required = true, disabled, children, ...props }) => (
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

export const FormSelect = ({ label, id, icon, value, onChange, disabled, options }) => (
  <FormField label={label} id={id} icon={icon} required={false}>
    <select id={id} name={id} value={value} onChange={onChange} disabled={disabled}>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </FormField>
);
