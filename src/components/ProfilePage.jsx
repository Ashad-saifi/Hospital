import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Heart, LogOut, Clock, FileText,
  Plus, Home, Shield, XCircle, CreditCard, Settings, Download,
  Activity, Thermometer, Wind, Check, CheckCircle, Eye
} from 'lucide-react';

/**
 * ProfilePage Component - Private Patient Dashboard
 */
const ProfilePage = ({
  activeUser,
  appointments = [],
  onLogout,
  onOpenAppointment,
  onCancelAppointment,
  onUpdateProfile
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    name: activeUser.name,
    phone: activeUser.phone,
    age: activeUser.age,
    gender: activeUser.gender,
    bloodGroup: activeUser.bloodGroup
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  if (!activeUser) return null;

  // Filter appointments for this user
  const userAppointments = appointments.filter(
    (app) => app.patientEmail.toLowerCase() === activeUser.email.toLowerCase()
  );

  // Get next upcoming appointment
  const sortedAppointments = [...userAppointments].sort((a, b) => {
    return new Date(a.appointDate) - new Date(b.appointDate);
  });

  const upcomingAppointment = sortedAppointments[0] || null;

  // Submit Handler for Profile Form
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setUpdateSuccess(false);

    const updatedUser = {
      ...activeUser,
      ...formData,
      age: parseInt(formData.age, 10)
    };

    onUpdateProfile(updatedUser);
    setUpdateSuccess(true);

    setTimeout(() => {
      setUpdateSuccess(false);
    }, 4000);
  };

  // Tab Details Vertically Stacked
  const tabs = [
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'vitals', label: 'Vitals & Health', icon: Heart },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  // ==========================================
  // RENDER DYNAMIC TAB CONTENT PANELS
  // ==========================================

  // 1. Appointments Panel
  const renderAppointmentsTab = () => (
    <div className="db-panel-card">
      <div className="panel-card-header">
        <h3 className="panel-card-title"><Calendar size={20} className="text-primary" /> Your Scheduled Consultations</h3>
        <p className="panel-card-subtitle">Manage, reschedule, or review your clinical visits and support history.</p>
      </div>

      {userAppointments.length === 0 ? (
        <div className="empty-panel-state">
          <Clock size={48} className="empty-state-icon animate-pulse" />
          <h4>No Consultations Found</h4>
          <p>You do not have any scheduled appointments at the moment. Click "Book Consultation" to schedule one.</p>
          <button onClick={onOpenAppointment} className="btn btn-primary mt-4">
            Schedule Your First Visit
          </button>
        </div>
      ) : (
        <div className="profile-appointments-grid">
          {userAppointments.map((app, index) => (
            <div key={app.id || index} className="profile-appointment-card">
              <div className="app-card-left">
                <div className="app-icon-badge">
                  <Calendar size={20} />
                </div>
                <div className="app-info-block">
                  <h4>{app.department}</h4>
                  <p className="app-date-time">
                    <Clock size={12} /> {app.appointDate} at {app.appointTime}
                  </p>
                </div>
              </div>

              <div className="app-card-center">
                <span className="status-indicator status-pending">Pending Confirmation</span>
                {app.additionalNotes && (
                  <div className="app-card-details-block">
                    <span className="details-header"><FileText size={12} /> Symptoms / Notes</span>
                    <p className="details-text">"{app.additionalNotes}"</p>
                  </div>
                )}
              </div>

              <div className="app-card-right">
                <button
                  id={`cancel-btn-${app.id}`}
                  onClick={() => onCancelAppointment(app.id)}
                  className="btn-cancel-appt"
                  title="Cancel Appointment"
                >
                  <XCircle size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Vitals Panel
  const renderVitalsTab = () => (
    <div className="db-panel-card">
      <div className="panel-card-header">
        <h3 className="panel-card-title"><Heart size={20} className="text-primary" /> Live Vitals & Health Metrics</h3>
        <p className="panel-card-subtitle">Real-time stats from your latest clinical screening and checkups.</p>
      </div>

      <div className="vitals-stats-grid">
        <div className="vital-widget-box pulse-card">
          <div className="vital-widget-top">
            <span className="vital-widget-label">Heart Rate</span>
            <Heart size={22} className="vital-icon text-red animate-pulse" />
          </div>
          <div className="vital-widget-value">70 <span className="vital-unit">bpm</span></div>
          <div className="vital-status-indicator indicator-success">Normal Pulse</div>
          <div className="vital-widget-footer">Last updated: Just now</div>
        </div>

        <div className="vital-widget-box BP-card">
          <div className="vital-widget-top">
            <span className="vital-widget-label">Blood Pressure</span>
            <Activity size={22} className="vital-icon text-blue" />
          </div>
          <div className="vital-widget-value">120/80 <span className="vital-unit">mmHg</span></div>
          <div className="vital-status-indicator indicator-success">Optimal Threshold</div>
          <div className="vital-widget-footer">Last updated: 2 hrs ago</div>
        </div>

        <div className="vital-widget-box glucose-card">
          <div className="vital-widget-top">
            <span className="vital-widget-label">Blood Sugar</span>
            <Shield size={22} className="vital-icon text-teal" />
          </div>
          <div className="vital-widget-value">95 <span className="vital-unit">mg/dL</span></div>
          <div className="vital-status-indicator indicator-success">Normal (Fasting)</div>
          <div className="vital-widget-footer">Last updated: 4 hrs ago</div>
        </div>

        <div className="vital-widget-box temp-card">
          <div className="vital-widget-top">
            <span className="vital-widget-label">Body Temperature</span>
            <Thermometer size={22} className="vital-icon text-orange" />
          </div>
          <div className="vital-widget-value">98.6 <span className="vital-unit">°F</span></div>
          <div className="vital-status-indicator indicator-success">Normal Temp</div>
          <div className="vital-widget-footer">Last updated: Just now</div>
        </div>

        <div className="vital-widget-box oxygen-card">
          <div className="vital-widget-top">
            <span className="vital-widget-label">Oxygen SpO2</span>
            <Wind size={22} className="vital-icon text-sky" />
          </div>
          <div className="vital-widget-value">99 <span className="vital-unit">%</span></div>
          <div className="vital-status-indicator indicator-success">Excellent Saturation</div>
          <div className="vital-widget-footer">Last updated: Just now</div>
        </div>
      </div>

      <div className="health-advisory-card mt-6">
        <div className="advisory-icon-wrapper">
          <Shield size={20} />
        </div>
        <div>
          <h4>Wellness Advisory</h4>
          <p>Your vitals are looking excellent today! Maintain your health by drinking at least 2.5 liters of water daily, walking for 30 minutes, and getting 7-8 hours of sound sleep.</p>
        </div>
      </div>
    </div>
  );

  // 3. Medical Records Panel
  const renderRecordsTab = () => {
    const records = [];

    return (
      <div className="db-panel-card">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><FileText size={20} className="text-primary" /> Electronic Health Records & Reports</h3>
          <p className="panel-card-subtitle">Access your clinical logs, diagnostic test reports, and active pharmaceutical prescriptions.</p>
        </div>

        {records.length === 0 ? (
          <div className="empty-panel-state">
            <FileText size={48} className="empty-state-icon animate-pulse" />
            <h4>No Medical Records Found</h4>
            <p>No health reports, laboratory diagnostics, or prescriptions are currently linked to your profile.</p>
          </div>
        ) : (
          <div className="db-table-wrapper">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Document Name</th>
                  <th>Date Issued</th>
                  <th>Clinic Department</th>
                  <th>Issued By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td className="font-mono">{rec.id}</td>
                    <td><strong>{rec.name}</strong></td>
                    <td>{rec.date}</td>
                    <td>{rec.dept}</td>
                    <td>{rec.doctor}</td>
                    <td>
                      <span className={`status-pill ${rec.status === 'Active' ? 'status-active' : 'status-completed'}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => alert(`Downloading document: ${rec.name}`)}
                        className="btn-download-record"
                        title="Download PDF Document"
                      >
                        <Download size={14} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 4. Billing Panel
  const renderBillingTab = () => {
    const invoices = [];

    return (
      <div className="db-panel-card">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><CreditCard size={20} className="text-primary" /> Invoices & Account Billing</h3>
          <p className="panel-card-subtitle">Review your diagnostic invoicing history, consultation charges, and pending clinic balances.</p>
        </div>

        <div className="billing-metrics-row mb-6">
          <div className="billing-metric-box">
            <span className="billing-metric-label">Total Amount Settled</span>
            <span className="billing-metric-val font-green">₹0.00</span>
          </div>
          <div className="billing-metric-box">
            <span className="billing-metric-label">Outstanding Balances</span>
            <span className="billing-metric-val font-yellow">₹0.00</span>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="empty-panel-state">
            <CreditCard size={48} className="empty-state-icon animate-pulse" />
            <h4>No Invoices Found</h4>
            <p>There are currently no billing statements or diagnostic invoices linked to your account.</p>
          </div>
        ) : (
          <div className="db-table-wrapper">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Billing Date</th>
                  <th>Description</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono">{inv.id}</td>
                    <td>{inv.date}</td>
                    <td>{inv.desc}</td>
                    <td><strong>{inv.amount}</strong></td>
                    <td>
                      <span className={`status-pill ${inv.status === 'Paid' ? 'status-paid' : 'status-pending-bill'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => alert(`Opening receipt for ${inv.id}`)}
                        className="btn-download-record"
                        disabled={inv.status === 'Pending'}
                        title={inv.status === 'Pending' ? 'Receipt will be available once settled' : 'Download receipt'}
                      >
                        <Eye size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // 5. Profile Settings Panel
  const renderSettingsTab = () => (
    <div className="db-panel-card">
      <div className="panel-card-header">
        <h3 className="panel-card-title"><Settings size={20} className="text-primary" /> Profile Settings & Preferences</h3>
        <p className="panel-card-subtitle">Modify your personal contact details, health demographics, and account profile.</p>
      </div>

      {updateSuccess && (
        <div className="settings-success-alert mb-6">
          <CheckCircle size={16} /> <span>Your profile metrics have been updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSettingsSubmit} className="db-settings-form">
        <div className="form-grid-2">
          <div className="form-input-group">
            <label htmlFor="settings-name">Full Patient Name <span className="req">*</span></label>
            <input
              type="text"
              id="settings-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="settings-email">Email Address <span className="req">*</span></label>
            <input
              type="email"
              id="settings-email"
              value={activeUser.email}
              disabled
              title="Email address cannot be changed."
            />
            <small className="help-text">Email address is locked as your primary patient key.</small>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-input-group">
            <label htmlFor="settings-phone">Phone Number <span className="req">*</span></label>
            <input
              type="text"
              id="settings-phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="settings-age">Age (Years) <span className="req">*</span></label>
            <input
              type="number"
              id="settings-age"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-input-group">
            <label htmlFor="settings-gender">Gender</label>
            <select
              id="settings-gender"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-input-group">
            <label htmlFor="settings-blood">Blood Group</label>
            <select
              id="settings-blood"
              value={formData.bloodGroup}
              onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
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

        <button type="submit" className="btn btn-primary btn-save-settings mt-2">
          <Check size={16} /> Save Changes
        </button>
      </form>
    </div>
  );

  return (
    <div className="db-layout-root">

      {/* 1. Dedicated Portal Header */}
      <header className="db-top-header">
        <div className="db-top-container">
          <div className="db-logo-wrapper" onClick={() => navigate('/')}>
            <div className="db-logo-icon-box">
              <Activity className="logo-icon animate-pulse" size={24} />
            </div>
            <span className="db-logo-text">MedCare <span className="logo-badge-text">Portal</span></span>
          </div>

          <div className="db-header-actions">
            <button onClick={() => navigate('/')} className="btn-db-action-outline">
              <Home size={16} />
              <span>Back to Website</span>
            </button>
            <button onClick={onOpenAppointment} className="btn-db-action-primary">
              <Plus size={16} />
              <span>Book Appointment</span>
            </button>
            <div className="db-user-badge">
              <div className="avatar-circle-sm">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="db-badge-name">Hi, {activeUser.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Full Width Core Portal Container */}
      <div className="db-portal-container container">
        <div className="profile-page-layout">

          {/* Left Side: Demographic and Account Information */}
          <div className="profile-sidebar">
            <div className="profile-card-primary">
              <div className="user-avatar-huge">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <h3>{activeUser.name}</h3>
              <span className="profile-role-badge">Patient ID: #{activeUser.id.substring(activeUser.id.length - 6)}</span>

              <div className="profile-meta-list">
                <div className="profile-meta-item">
                  <Mail size={16} className="meta-icon" />
                  <div>
                    <span className="meta-label">Email Address</span>
                    <span className="meta-val">{activeUser.email}</span>
                  </div>
                </div>
                <div className="profile-meta-item">
                  <Phone size={16} className="meta-icon" />
                  <div>
                    <span className="meta-label">Phone Number</span>
                    <span className="meta-val">{activeUser.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card-medical">
              <h4 className="card-title-small"><Shield size={16} /> Health Passport</h4>
              <div className="medical-stats-grid">
                <div className="med-stat-item">
                  <span className="med-stat-label">Blood Group</span>
                  <span className="med-stat-val val-blood">{activeUser.bloodGroup}</span>
                </div>
                <div className="med-stat-item">
                  <span className="med-stat-label">Age</span>
                  <span className="med-stat-val">{activeUser.age} yrs</span>
                </div>
                <div className="med-stat-item">
                  <span className="med-stat-label">Gender</span>
                  <span className="med-stat-val">{activeUser.gender}</span>
                </div>
              </div>
            </div>

            {/* Sidebar View Navigation Tabs Stack */}
            <div className="db-sidebar-nav-list">
              {tabs.map(tab => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`db-sidebar-nav-item ${isSelected ? 'active-tab-item' : ''}`}
                  >
                    <TabIcon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button onClick={onLogout} className="db-sidebar-nav-item item-logout">
                <LogOut size={18} />
                <span>Logout Account</span>
              </button>
            </div>
          </div>

          {/* Right Side: Tab Panel Routing Dashboard Content */}
          <div className="profile-main-content">

            {/* Quick Metrics */}
            <div className="metrics-row">
              <div className="metric-box">
                <span className="metric-title">Total Appointments</span>
                <span className="metric-value">{userAppointments.length}</span>
              </div>

              <div className="metric-box highlighted-metric">
                <span className="metric-title">Next Scheduled</span>
                <span className="metric-value">
                  {upcomingAppointment ? `${upcomingAppointment.appointDate}` : 'None'}
                </span>
                {upcomingAppointment && (
                  <span className="metric-subtitle">
                    at {upcomingAppointment.appointTime} - {upcomingAppointment.department}
                  </span>
                )}
              </div>
            </div>

            {/* Active view component renders dynamically here */}
            {activeTab === 'appointments' && renderAppointmentsTab()}
            {activeTab === 'vitals' && renderVitalsTab()}
            {activeTab === 'records' && renderRecordsTab()}
            {activeTab === 'billing' && renderBillingTab()}
            {activeTab === 'settings' && renderSettingsTab()}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
