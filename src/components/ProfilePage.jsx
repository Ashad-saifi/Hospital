import React from 'react';
import { User, Mail, Phone, Calendar, Heart, LogOut, Clock, FileText, Plus, Home, Shield } from 'lucide-react';

const ProfilePage = ({ activeUser, appointments = [], onLogout, onOpenAppointment, onGoHome }) => {
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

  return (
    <div className="profile-page-container container section-padding">
      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">Welcome Back, {activeUser.name.split(' ')[0]}</h1>
          <p className="profile-page-subtitle">Access your health record, view appointments, and manage consultations.</p>
        </div>
        <div className="profile-header-actions">
          <button onClick={onGoHome} className="btn btn-outline">
            <Home size={18} />
            Back to Home
          </button>
          <button onClick={onOpenAppointment} className="btn btn-primary">
            <Plus size={18} />
            Book Consultation
          </button>
        </div>
      </div>

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

            <button onClick={onLogout} className="btn btn-outline btn-logout w-full mt-6">
              <LogOut size={16} />
              Logout Account
            </button>
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
        </div>

        {/* Right Side: Appointments and Records Dashboard */}
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

          {/* Appointments List Panel */}
          <div className="appointments-panel">
            <h3 className="panel-title">Your Scheduled Consultations</h3>
            
            {userAppointments.length === 0 ? (
              <div className="empty-panel-state">
                <Clock size={48} className="empty-state-icon" />
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
                    
                    {app.additionalNotes && (
                      <div className="app-card-details-block">
                        <span className="details-header"><FileText size={12} /> Symptoms / Notes</span>
                        <p className="details-text">"{app.additionalNotes}"</p>
                      </div>
                    )}

                    <div className="app-card-status">
                      <span className="status-indicator status-pending">Pending Confirmation</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
