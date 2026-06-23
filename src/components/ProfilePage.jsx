import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Calendar, Heart, LogOut, Clock, FileText,
  Plus, Home, Shield, XCircle, CreditCard, Settings, Download,
  Activity, Thermometer, Wind, Check, CheckCircle, Eye, MessageSquare, AlertCircle
} from 'lucide-react';
import './ProfilePage.css';
import { 
  apiGetPrescriptions, 
  apiCreatePrescription, 
  apiDeletePrescription,
  apiLogPillbox, 
  apiGetMessages, 
  apiSendMessage, 
  apiGetLabReports,
  apiCreateLabReport
} from '../utils/api';

/**
 * ProfilePage Component - Private Patient Dashboard
 */
const ProfilePage = ({
  activeUser,
  appointments = [],
  doctorsList = [],
  onLogout,
  onOpenAppointment,
  onCancelAppointment,
  onUpdateProfile,
  onUpdateAppointmentStatus,
  onUpdateDoctorProfile
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);

  // Advanced Features State Variables
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedReportForDetails, setSelectedReportForDetails] = useState(null);
  const [doctorLabReports, setDoctorLabReports] = useState({});
  
  // Prescription creator form state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [medicinesList, setMedicinesList] = useState([{ name: "", dosage: "1-0-1", duration: "5 days", instructions: "After food" }]);
  
  // Chat messaging state
  const [selectedChatUser, setSelectedChatUser] = useState(null); 
  const [chatText, setChatText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [vitalsChartMetric, setVitalsChartMetric] = useState('hr');

  // Analytics state variables
  const [estAppointmentsPerWeek, setEstAppointmentsPerWeek] = useState(15);
  const [customFee, setCustomFee] = useState(500);

  // Lab Report Upload Modal States
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [reportPatientEmail, setReportPatientEmail] = useState("");
  const [reportPatientName, setReportPatientName] = useState("");
  const [reportTestName, setReportTestName] = useState("Complete Blood Count (CBC)");
  const [reportBiomarkers, setReportBiomarkers] = useState([
    { parameter: "Hemoglobin", value: "14.0", unit: "g/dL", referenceRange: "13.0 - 17.0", status: "Normal" }
  ]);

  const handleAddBiomarkerRow = () => {
    setReportBiomarkers(prev => [...prev, { parameter: "", value: "", unit: "", referenceRange: "", status: "Normal" }]);
  };

  const handleRemoveBiomarkerRow = (idx) => {
    setReportBiomarkers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBiomarkerChange = (idx, field, val) => {
    setReportBiomarkers(prev => prev.map((bio, i) => i === idx ? { ...bio, [field]: val } : bio));
  };

  const handleSaveLabReport = async (e) => {
    e.preventDefault();
    if (!reportPatientEmail.trim() || !reportTestName.trim() || reportBiomarkers.some(b => !b.parameter.trim() || !b.value.trim())) {
      alert("Please fill in all biomarker parameters and values.");
      return;
    }

    const payload = {
      patientEmail: reportPatientEmail.toLowerCase(),
      patientName: reportPatientName || "Active Patient",
      doctorName: activeUser.name,
      testName: reportTestName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      results: reportBiomarkers
    };

    try {
      await apiCreateLabReport(payload);
      alert("Lab report uploaded successfully!");
      setShowUploadReportModal(false);
      
      // Refresh reports lists:
      const updatedReports = await apiGetLabReports(activeUser.email);
      setLabReports(updatedReports);
      
      if (appointments.length) {
        const patientEmails = Array.from(new Set(appointments.map(app => app.patientEmail?.toLowerCase()).filter(Boolean)));
        const reportsMap = {};
        for (const email of patientEmails) {
          try {
            const reports = await apiGetLabReports(email);
            reportsMap[email] = reports;
          } catch (err) {
            console.error('Error reloading lab reports:', err);
          }
        }
        setDoctorLabReports(reportsMap);
      }
    } catch (err) {
      console.error("Failed to upload lab report:", err);
      alert("Upload failed: " + err.message);
    }
  };

  useEffect(() => {
    if (activeUser?.doctorDetails?.fee) {
      const parsed = parseInt(activeUser.doctorDetails.fee.toString().replace(/\D/g, ''), 10);
      if (!isNaN(parsed)) {
        setCustomFee(parsed);
      }
    }
  }, [activeUser]);

  // Load Prescriptions & Lab Reports (Real-time polling)
  useEffect(() => {
    async function fetchData() {
      if (activeUser?.email) {
        try {
          const rxList = await apiGetPrescriptions(activeUser.email);
          setPrescriptions(rxList);
          
          if (activeUser.role !== 'doctor') {
            const labList = await apiGetLabReports(activeUser.email);
            setLabReports(labList);
          }
        } catch (err) {
          console.error("Error loading dashboard data:", err);
        }
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [activeUser]);

  // Fetch lab reports for doctors' patients to generate clinical alerts (Real-time polling)
  useEffect(() => {
    let intervalId = null;
    if (activeUser?.role === 'doctor' && appointments.length) {
      const patientEmails = Array.from(new Set(appointments.map(app => app.patientEmail?.toLowerCase()).filter(Boolean)));
      async function fetchReports() {
        const reportsMap = {};
        for (const email of patientEmails) {
          try {
            const reports = await apiGetLabReports(email);
            reportsMap[email] = reports;
          } catch (err) {
            console.error('Error loading lab reports for', email, err);
          }
        }
        setDoctorLabReports(reportsMap);
      }
      fetchReports();
      intervalId = setInterval(fetchReports, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeUser, appointments]);


  // Polling for Chat Messages
  useEffect(() => {
    let intervalId = null;
    async function loadChat() {
      if (activeUser?.email && selectedChatUser?.email) {
        try {
          const msgs = await apiGetMessages(activeUser.email, selectedChatUser.email);
          setChatMessages(msgs);
        } catch (err) {
          console.error("Error polling chat:", err);
        }
      }
    }
    
    if (selectedChatUser) {
      loadChat(); // initial load
      intervalId = setInterval(loadChat, 3000); // poll every 3 seconds
    } else {
      setChatMessages([]);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeUser, selectedChatUser]);

  // Pillbox Toggle Handler
  const handlePillboxToggle = async (rxId, date, isTaken) => {
    try {
      const res = await apiLogPillbox(rxId, date, isTaken);
      setPrescriptions(prev => prev.map(rx => rx.id === rxId ? res.prescription : rx));
    } catch (err) {
      console.error("Failed to log pillbox:", err);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatText.trim() || !selectedChatUser) return;
    
    const payload = {
      senderEmail: activeUser.email,
      receiverEmail: selectedChatUser.email,
      senderName: activeUser.name,
      receiverName: selectedChatUser.name,
      text: chatText
    };
    
    try {
      const newMsg = await apiSendMessage(payload);
      setChatMessages(prev => [...prev, newMsg]);
      setChatText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Prescription Handlers (Doctor)
  const handleAddMedicineRow = () => {
    setMedicinesList(prev => [...prev, { name: "", dosage: "1-0-1", duration: "5 days", instructions: "After food" }]);
  };
  
  const handleRemoveMedicineRow = (idx) => {
    setMedicinesList(prev => prev.filter((_, i) => i !== idx));
  };
  
  const handleMedicineChange = (idx, field, val) => {
    setMedicinesList(prev => prev.map((med, i) => i === idx ? { ...med, [field]: val } : med));
  };
  
  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!prescriptionAppt || medicinesList.some(m => !m.name.trim())) {
      alert("Please fill in all medicine names.");
      return;
    }
    
    const payload = {
      appointmentId: prescriptionAppt.id || prescriptionAppt._id,
      patientEmail: prescriptionAppt.patientEmail || prescriptionAppt.patientData?.[0]?.email || "",
      patientName: prescriptionAppt.patientName,
      doctorEmail: activeUser.email,
      doctorName: activeUser.name,
      medicines: medicinesList
    };
    
    try {
      await apiCreatePrescription(payload);
      const rxList = await apiGetPrescriptions(activeUser.email);
      setPrescriptions(rxList);
      setShowPrescriptionModal(false);
      setPrescriptionAppt(null);
      setMedicinesList([{ name: "", dosage: "1-0-1", duration: "5 days", instructions: "After food" }]);
    } catch (err) {
      console.error("Failed to save prescription:", err);
      alert("Error saving prescription: " + err.message);
    }
  };

  const handleDeletePrescription = async (rxId) => {
    if (!window.confirm("Are you sure you want to delete/cancel this prescription?")) return;
    try {
      await apiDeletePrescription(rxId);
      setPrescriptions(prev => prev.filter(rx => (rx.id !== rxId && rx._id !== rxId)));
    } catch (err) {
      console.error("Failed to delete prescription:", err);
      alert("Error deleting prescription: " + err.message);
    }
  };

  const toggleExpand = (appId) => {
    setExpandedAppId(prev => (prev === appId ? null : appId));
  };

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    name: activeUser?.name || '',
    phone: activeUser?.phone || '',
    age: activeUser?.age || '',
    gender: activeUser?.gender || 'Male',
    bloodGroup: activeUser?.bloodGroup || 'O+',
    specialty: activeUser?.doctorDetails?.specialty || 'General Medicine',
    exp: activeUser?.doctorDetails?.exp || activeUser?.doctorDetails?.experience || '10 yrs',
    fee: activeUser?.doctorDetails?.fee || '₹500',
    hospital: activeUser?.doctorDetails?.hospital || 'City Medical Center',
    timingToday: activeUser?.doctorDetails?.timingToday || '9:00 AM - 5:00 PM',
    weeklySchedule: activeUser?.doctorDetails?.weeklySchedule || 'Monday - Friday',
    education: activeUser?.doctorDetails?.education || 'MBBS',
    bio: activeUser?.doctorDetails?.bio || 'Dedicated medical specialist.',
    languages: activeUser?.doctorDetails?.languages || 'English, Hindi',
    clinicName: activeUser?.doctorDetails?.clinicName || 'Suite 404',
    consultationType: activeUser?.doctorDetails?.consultationType || 'Both',
    statusText: activeUser?.doctorDetails?.statusText || 'Active & Available',
    height: activeUser?.patientDetails?.height || '',
    weight: activeUser?.patientDetails?.weight || '',
    allergies: activeUser?.patientDetails?.allergies || '',
    chronicConditions: activeUser?.patientDetails?.chronicConditions || '',
    emergencyContact: activeUser?.patientDetails?.emergencyContact || '',
    address: activeUser?.patientDetails?.address || ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [isDoctorOnline, setIsDoctorOnline] = useState(() => {
    return activeUser?.doctorDetails?.isOnline !== false;
  });

  useEffect(() => {
    if (activeUser?.doctorDetails) {
      setIsDoctorOnline(activeUser.doctorDetails.isOnline !== false);
    }
  }, [activeUser]);

  const handleToggleStatus = () => {
    const nextStatus = !isDoctorOnline;
    setIsDoctorOnline(nextStatus);
    onUpdateDoctorProfile({ isOnline: nextStatus });
  };

  if (!activeUser) return null;

  // Filter appointments for this user
  const userAppointments = activeUser.role === 'doctor'
    ? appointments
    : appointments.filter(
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

    if (activeUser.role === 'doctor') {
      const doctorPayload = {
        name: formData.name,
        phone: formData.phone,
        specialty: formData.specialty,
        exp: formData.exp,
        fee: formData.fee,
        hospital: formData.hospital,
        timingToday: formData.timingToday,
        weeklySchedule: formData.weeklySchedule,
        education: formData.education,
        bio: formData.bio,
        languages: formData.languages,
        clinicName: formData.clinicName,
        consultationType: formData.consultationType,
        statusText: formData.statusText
      };
      onUpdateDoctorProfile(doctorPayload);
    } else {
      const updatedUser = {
        ...activeUser,
        ...formData,
        age: parseInt(formData.age, 10)
      };
      onUpdateProfile(updatedUser);
    }

    setUpdateSuccess(true);
    setTimeout(() => {
      setUpdateSuccess(false);
    }, 4000);
  };

  // Tab Details Vertically Stacked
  const tabs = activeUser.role === 'doctor'
    ? [
        { id: 'appointments', label: 'Appointment Requests', icon: Calendar },
        { id: 'patients', label: 'My Patients', icon: User },
        { id: 'prescriptions', label: 'Prescription History', icon: FileText },
        { id: 'analytics', label: 'Practice Analytics', icon: Activity },
        { id: 'labreports', label: 'Lab Reports', icon: FileText },
        { id: 'settings', label: 'Account Settings', icon: Settings }
      ]
    : [
        { id: 'appointments', label: 'My Appointments', icon: Calendar },
        { id: 'doctors', label: 'Our Doctors', icon: User },
        { id: 'vitals', label: 'Vitals & Health', icon: Heart },
        { id: 'records', label: 'Medical Records', icon: FileText },
        { id: 'labreports', label: 'Lab Reports', icon: FileText },
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
          {userAppointments.map((app, index) => {
            const appId = app.id || app._id || index;
            const isExpanded = expandedAppId === appId;
            const isDoctor = activeUser.role === 'doctor';
            const appStatus = app.status || 'Pending';
            
            return (
              <div key={appId} className={`profile-appointment-card ${isExpanded ? 'is-expanded' : ''}`}>
                <div 
                  className="app-card-main" 
                  onClick={() => toggleExpand(appId)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="app-card-left">
                    <div className="app-icon-badge">
                      {isDoctor ? <User size={20} /> : <Calendar size={20} />}
                    </div>
                    <div className="app-info-block">
                      <h4>{isDoctor ? `Patient: ${app.patientName}` : app.department}</h4>
                      <p className="app-date-time">
                        <Clock size={12} /> {app.appointDate} at {app.appointTime}
                      </p>
                    </div>
                  </div>

                  <div className="app-card-center">
                    <span className={`status-indicator ${
                      appStatus === 'Confirmed' ? 'status-confirmed' :
                      appStatus === 'Rejected' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {appStatus}
                    </span>
                    {app.additionalNotes && (
                      <div className="app-card-details-block">
                        <span className="details-header"><FileText size={12} /> Symptoms / Notes</span>
                        <p className="details-text">"{app.additionalNotes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="app-card-right">
                    {isDoctor ? (
                      <div className="doctor-action-btns">
                        {appStatus === 'Pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateAppointmentStatus(appId, "Confirmed");
                              }}
                              className="btn-confirm-appt"
                              title="Confirm Appointment"
                            >
                              <Check size={14} />
                              Confirm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelAppointment(appId);
                              }}
                              className="btn-decline-appt"
                              title="Delete Appointment"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}
                            >
                              <XCircle size={14} />
                              Delete
                            </button>
                          </>
                        )}
                        {appStatus === 'Confirmed' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrescriptionAppt(app);
                                setMedicinesList([{ name: "", dosage: "1-0-1", duration: "5 days", instructions: "After food" }]);
                                setShowPrescriptionModal(true);
                              }}
                              className="btn-confirm-appt"
                              style={{ color: '#059669', borderColor: 'rgba(5, 150, 105, 0.25)', backgroundColor: 'rgba(5, 150, 105, 0.04)' }}
                            >
                              <Plus size={14} />
                              Write Rx
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelAppointment(appId);
                              }}
                              className="btn-decline-appt"
                              title="Delete Appointment"
                              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}
                            >
                              <XCircle size={14} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        id={`cancel-btn-${appId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelAppointment(appId);
                        }}
                        className="btn-cancel-appt"
                        title="Cancel Appointment"
                      >
                        <XCircle size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="appointment-card-expanded">
                    <div className="expanded-details-grid" style={{ gridTemplateColumns: isDoctor ? '1fr' : '1fr 1fr' }}>
                      {/* Patient Details Section */}
                      {app.patientData && app.patientData[0] && (
                        <>
                          <div className="expanded-info-panel patient-details-panel">
                          <h5><User size={16} /> Patient Medical Profile</h5>
                          <div className="expanded-details-list">
                            <div className="expanded-detail-item">
                              <span className="detail-label">Name:</span>
                              <span className="detail-value">{app.patientData[0].name}</span>
                            </div>
                            <div className="expanded-detail-item">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{app.patientData[0].email}</span>
                            </div>
                            {app.patientData[0].phone && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-value">{app.patientData[0].phone}</span>
                              </div>
                            )}
                            <div className="expanded-detail-item">
                              <span className="detail-label">Age / Gender:</span>
                              <span className="detail-value">{app.patientData[0].age} yrs / {app.patientData[0].gender}</span>
                            </div>
                            {app.patientData[0].bloodType && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Blood Group:</span>
                                <span className="detail-value font-highlight">{app.patientData[0].bloodType}</span>
                              </div>
                            )}
                            {app.patientData[0].height && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Height:</span>
                                <span className="detail-value">{app.patientData[0].height}</span>
                              </div>
                            )}
                            {app.patientData[0].weight && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Weight:</span>
                                <span className="detail-value">{app.patientData[0].weight}</span>
                              </div>
                            )}
                            {app.patientData[0].chronicConditions && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Chronic Conditions:</span>
                                <span className="detail-value text-orange-500 font-bold">{app.patientData[0].chronicConditions}</span>
                              </div>
                            )}
                            {app.patientData[0].allergies && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Allergies:</span>
                                <span className="detail-value text-red font-bold">{app.patientData[0].allergies}</span>
                              </div>
                            )}
                            {app.patientData[0].emergencyContact && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Emergency Contact:</span>
                                <span className="detail-value font-highlight">{app.patientData[0].emergencyContact}</span>
                              </div>
                            )}
                            {app.patientData[0].address && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Address:</span>
                                <span className="detail-value">{app.patientData[0].address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isDoctor && (
                          <div className="expanded-info-panel alerts-panel">
                            <h5><AlertCircle size={16} /> Clinical Alerts</h5>
                            {doctorLabReports[app.patientData[0].email]?.filter(r => r.isCritical).length > 0 ? (
                              <ul className="alerts-list">
                                {doctorLabReports[app.patientData[0].email]
                                  .filter(r => r.isCritical)
                                  .map((alert, idx) => (
                                    <li key={idx} className="alert-item">
                                      <span className="alert-title">{alert.title || 'Alert'}</span>: <span className="alert-detail">{alert.detail || 'Critical lab result'}</span>
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p>No critical alerts.</p>
                            )}
                          </div>
                        )}
                        </>
                      )}

                      {/* Doctor Details Section (Patient View Only) */}
                      {!isDoctor && app.doctorData && app.doctorData[0] && (
                        <div className="expanded-info-panel doctor-details-panel">
                          <h5><Activity size={16} /> Attending Doctor</h5>
                          <div className="expanded-details-list">
                            <div className="expanded-detail-item">
                              <span className="detail-label">Name:</span>
                              <span className="detail-value">{app.doctorData[0].name}</span>
                            </div>
                            <div className="expanded-detail-item">
                              <span className="detail-label">Specialty:</span>
                              <span className="detail-value">{app.doctorData[0].specialty}</span>
                            </div>
                            {app.doctorData[0].exp && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Experience:</span>
                                <span className="detail-value">{app.doctorData[0].exp}</span>
                              </div>
                            )}
                            {app.doctorData[0].hospital && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Hospital:</span>
                                <span className="detail-value">{app.doctorData[0].hospital}</span>
                              </div>
                            )}
                            {app.doctorData[0].timingToday && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Available Timings:</span>
                                <span className="detail-value">{app.doctorData[0].timingToday}</span>
                              </div>
                            )}
                            {app.doctorData[0].fee && (
                              <div className="expanded-detail-item">
                                <span className="detail-label">Consultation Fee:</span>
                                <span className="detail-value font-highlight">{app.doctorData[0].fee}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 1a. Connected Patients (Doctor View)
  const renderDoctorPatientsTab = () => {
    const patientsMap = {};
    appointments.forEach(app => {
      if (app.patientData && app.patientData[0]) {
        const patient = app.patientData[0];
        const emailLower = patient.email.toLowerCase();
        if (!patientsMap[emailLower]) {
          patientsMap[emailLower] = {
            ...patient,
            appointmentsCount: 0,
            lastVisit: app.appointDate + ' ' + app.appointTime,
            latestAppointment: app
          };
        }
        patientsMap[emailLower].appointmentsCount += 1;
      }
    });
    
    const uniquePatients = Object.values(patientsMap);

    return (
      <div className="db-panel-card animate-fadeIn">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><User size={20} className="text-primary" /> Connected Patients</h3>
          <p className="panel-card-subtitle">Detailed clinical directory of all patients with registered appointment history.</p>
        </div>
        
        {uniquePatients.length === 0 ? (
          <div className="empty-panel-state">
            <User size={48} className="empty-state-icon animate-pulse" />
            <h4>No Patients Registered</h4>
            <p>Once patients book appointments with you, they will appear here in your directory.</p>
          </div>
        ) : (
          <div className="doctor-patients-grid">
            {uniquePatients.map((patient) => {
              const patientAlerts = doctorLabReports[patient.email]?.filter(r => r.isCritical) || [];
              const hasAlerts = patientAlerts.length > 0;
              
              return (
                <div key={patient.email} className="doctor-patient-card">
                  <div className="patient-card-header-layout">
                    <div className="avatar-circle-sm">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="patient-card-title-block">
                      <h4>{patient.name}</h4>
                      <p className="patient-card-meta">Age: {patient.age || 'N/A'} | {patient.gender || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="patient-card-body">
                    <div className="patient-detail-field">
                      <span className="field-label">Email:</span>
                      <span className="field-value">{patient.email}</span>
                    </div>
                    {patient.phone && (
                      <div className="patient-detail-field">
                        <span className="field-label">Phone:</span>
                        <span className="field-value">{patient.phone}</span>
                      </div>
                    )}
                    <div className="patient-detail-field">
                      <span className="field-label">Blood Group:</span>
                      <span className="field-value font-highlight">{patient.bloodType || patient.bloodGroup || 'N/A'}</span>
                    </div>
                    {patient.chronicConditions && (
                      <div className="patient-detail-field">
                        <span className="field-label">Conditions:</span>
                        <span className="field-value text-orange-500 font-bold">{patient.chronicConditions}</span>
                      </div>
                    )}
                    {patient.allergies && (
                      <div className="patient-detail-field">
                        <span className="field-label">Allergies:</span>
                        <span className="field-value text-red font-bold">{patient.allergies}</span>
                      </div>
                    )}
                    {patient.emergencyContact && (
                      <div className="patient-detail-field">
                        <span className="field-label">Emergency Contact:</span>
                        <span className="field-value font-highlight">{patient.emergencyContact}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="patient-detail-field">
                        <span className="field-label">Address:</span>
                        <span className="field-value">{patient.address}</span>
                      </div>
                    )}
                    
                    <div className="patient-card-stats-row">
                      <div className="stat-pill">
                        <span className="pill-number">{patient.appointmentsCount}</span>
                        <span className="pill-label">Visits</span>
                      </div>
                      <div className="stat-pill">
                        <span className="pill-val-text">{patient.lastVisit || 'N/A'}</span>
                        <span className="pill-label">Last Consulted</span>
                      </div>
                    </div>
                    
                    {hasAlerts && (
                      <div className="patient-card-alerts-box">
                        <h5 className="alerts-title-small"><AlertCircle size={14} className="text-red animate-pulse" /> Critical Lab Alerts</h5>
                        <ul className="patient-alerts-list">
                          {patientAlerts.map((alert, idx) => (
                            <li key={idx} className="patient-alert-item">
                              <strong>{alert.testName || alert.title}</strong>: {alert.detail || 'Critical result detected'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="patient-card-actions">
                    <button 
                      onClick={() => {
                        setPrescriptionAppt(patient.latestAppointment);
                        setMedicinesList([{ name: "", dosage: "1-0-1", duration: "5 days", instructions: "After food" }]);
                        setShowPrescriptionModal(true);
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <Plus size={14} /> Write Rx
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedChatUser({
                          email: patient.email,
                          name: patient.name,
                          role: 'patient'
                        });
                        setIsChatOpen(true);
                      }}
                      className="btn btn-sm btn-outline"
                    >
                      <MessageSquare size={14} /> Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 1b. Prescription History (Doctor View)
  const renderDoctorPrescriptionsTab = () => {
    const doctorRx = prescriptions.filter(rx => rx.doctorEmail?.toLowerCase() === activeUser.email.toLowerCase());
    
    return (
      <div className="db-panel-card animate-fadeIn">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><FileText size={20} className="text-primary" /> Written Prescriptions</h3>
          <p className="panel-card-subtitle">Keep track of and manage all prescriptions you have issued to patients.</p>
        </div>
        
        {doctorRx.length === 0 ? (
          <div className="empty-panel-state">
            <FileText size={48} className="empty-state-icon animate-pulse" />
            <h4>No Prescriptions Issued</h4>
            <p>You have not written any prescriptions yet. You can write prescriptions from the "Appointment Requests" or "My Patients" tabs.</p>
          </div>
        ) : (
          <div className="doctor-prescriptions-list">
            {doctorRx.map((rx) => (
              <div key={rx.id || rx._id} className="doctor-prescription-card">
                <div className="rx-card-header">
                  <div className="rx-header-left">
                    <div className="rx-badge"><FileText size={16} /></div>
                    <div>
                      <h4>Patient: {rx.patientName || rx.patientEmail}</h4>
                      <p className="rx-date">Issued on {rx.date}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeletePrescription(rx.id || rx._id)}
                    className="btn btn-sm btn-outline text-red"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' }}
                  >
                    Delete Rx
                  </button>
                </div>
                
                <div className="rx-card-body">
                  <table className="rx-medicines-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td className="med-name">{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.duration}</td>
                          <td className="med-inst">{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 1c. Practice Analytics Panel (Doctor View)
  const renderDoctorAnalyticsTab = () => {
    // Parsing helpers
    const parseFee = (feeStr) => {
      if (!feeStr) return 500;
      const num = parseInt(feeStr.toString().replace(/\D/g, ''), 10);
      return isNaN(num) ? 500 : num;
    };

    const feeVal = parseFee(activeUser?.doctorDetails?.fee);
    
    // Count stats
    const confirmedApps = appointments.filter(app => app.status === 'Confirmed');
    const pendingApps = appointments.filter(app => app.status === 'Pending');
    const cancelledApps = appointments.filter(app => app.status === 'Rejected' || app.status === 'Cancelled');
    
    const confirmedEarnings = confirmedApps.length * feeVal;
    const pendingEarnings = pendingApps.length * feeVal;
    
    const totalAppsCount = appointments.length;
    const successRate = totalAppsCount ? Math.round((confirmedApps.length / totalAppsCount) * 100) : 0;
    const uniquePatientsCount = new Set(appointments.map(app => app.patientEmail?.toLowerCase()).filter(Boolean)).size;

    // Chart parameters
    const maxVal = Math.max(confirmedApps.length, pendingApps.length, cancelledApps.length, 1);
    const confirmedHeight = (confirmedApps.length / maxVal) * 120;
    const pendingHeight = (pendingApps.length / maxVal) * 120;
    const cancelledHeight = (cancelledApps.length / maxVal) * 120;

    // Projected Revenues
    const projectedMonthly = estAppointmentsPerWeek * 4.33 * customFee;
    const projectedAnnual = estAppointmentsPerWeek * 52 * customFee;

    return (
      <div className="db-panel-card animate-fadeIn">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><Activity size={20} className="text-primary" /> Practice Analytics & Insights</h3>
          <p className="panel-card-subtitle">Real-time professional metrics, financial growth, and appointment status breakdown.</p>
        </div>

        {/* Analytics Widgets */}
        <div className="analytics-stats-grid">
          <div className="analytics-widget-box gradient-widget">
            <span className="widget-label">Confirmed Earnings</span>
            <span className="widget-val">₹{confirmedEarnings.toLocaleString('en-IN')}</span>
            <span className="widget-sub">From {confirmedApps.length} confirmed visits</span>
          </div>

          <div className="analytics-widget-box">
            <span className="widget-label">Pending Pipeline</span>
            <span className="widget-val" style={{ color: 'var(--accent-color)' }}>₹{pendingEarnings.toLocaleString('en-IN')}</span>
            <span className="widget-sub">{pendingApps.length} pending requests</span>
          </div>

          <div className="analytics-widget-box">
            <span className="widget-label">Consultation Success</span>
            <span className="widget-val" style={{ color: '#10b981' }}>{successRate}%</span>
            <span className="widget-sub">Ratio of confirmed appointments</span>
          </div>

          <div className="analytics-widget-box">
            <span className="widget-label">Active Patient Base</span>
            <span className="widget-val">{uniquePatientsCount}</span>
            <span className="widget-sub">Unique patients registered</span>
          </div>
        </div>

        {/* Chart & Calculator Layout */}
        <div className="analytics-grid-two">
          
          {/* Custom SVG Bar Chart */}
          <div className="analytics-card">
            <h4 className="analytics-card-title">
              <Activity size={18} className="text-primary" />
              Appointment Breakdown
            </h4>
            <p className="analytics-card-subtitle">Visual distribution of consultation bookings by status</p>
            
            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
              <svg viewBox="0 0 400 200" width="100%" height="100%">
                <defs>
                  <linearGradient id="confirmedBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="pendingBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="cancelledBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="380" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="90" x2="380" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="150" x2="380" y2="150" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Y Axis Labels */}
                <text x="25" y="34" fill="#94a3b8" fontSize="10" textAnchor="end">{maxVal}</text>
                <text x="25" y="94" fill="#94a3b8" fontSize="10" textAnchor="end">{Math.round(maxVal / 2)}</text>
                <text x="25" y="154" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>

                {/* Confirmed Bar */}
                <rect 
                  x="80" 
                  y={150 - confirmedHeight} 
                  width="40" 
                  height={confirmedHeight} 
                  rx="6" 
                  fill="url(#confirmedBarGrad)" 
                />
                <text x="100" y={145 - confirmedHeight} fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {confirmedApps.length}
                </text>

                {/* Pending Bar */}
                <rect 
                  x="180" 
                  y={150 - pendingHeight} 
                  width="40" 
                  height={pendingHeight} 
                  rx="6" 
                  fill="url(#pendingBarGrad)" 
                />
                <text x="200" y={145 - pendingHeight} fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {pendingApps.length}
                </text>

                {/* Cancelled Bar */}
                <rect 
                  x="280" 
                  y={150 - cancelledHeight} 
                  width="40" 
                  height={cancelledHeight} 
                  rx="6" 
                  fill="url(#cancelledBarGrad)" 
                />
                <text x="300" y={145 - cancelledHeight} fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {cancelledApps.length}
                </text>

                {/* X Axis Labels */}
                <text x="100" y="170" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Confirmed</text>
                <text x="200" y="170" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Pending</text>
                <text x="300" y="170" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Declined</text>
              </svg>
            </div>
          </div>

          {/* Interactive Revenue Calculator */}
          <div className="analytics-card">
            <h4 className="analytics-card-title">
              <CreditCard size={18} className="text-primary" />
              Practice Revenue Projection
            </h4>
            <p className="analytics-card-subtitle">Estimate your professional revenue growth and consultations</p>
            
            <div className="calculator-form">
              <div className="calc-input-group">
                <label>Weekly Appointments: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{estAppointmentsPerWeek}</span></label>
                <div className="calc-slider-wrapper">
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={estAppointmentsPerWeek} 
                    onChange={(e) => setEstAppointmentsPerWeek(parseInt(e.target.value, 10))} 
                  />
                  <span className="calc-slider-val">{estAppointmentsPerWeek} / wk</span>
                </div>
              </div>

              <div className="calc-input-group">
                <label>Fee Per Appointment: <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{customFee}</span></label>
                <div className="calc-slider-wrapper">
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="50"
                    value={customFee} 
                    onChange={(e) => setCustomFee(parseInt(e.target.value, 10))} 
                  />
                  <span className="calc-slider-val">₹{customFee}</span>
                </div>
              </div>

              <div className="calc-results-card">
                <div className="calc-result-box">
                  <span className="calc-result-label">Monthly Gross</span>
                  <span className="calc-result-val">₹{Math.round(projectedMonthly).toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-result-box">
                  <span className="calc-result-label">Annual Projected</span>
                  <span className="calc-result-val">₹{Math.round(projectedAnnual).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1d. Lab Reports Panel (Patient & Doctor Views) */}
        {renderLabReportsTab()}

      </div>
    );
  };

  const renderLabReportsTab = () => {
    const isDoctor = activeUser.role === 'doctor';
    
    if (isDoctor) {
      const patientEmails = Array.from(new Set(appointments.map(app => app.patientEmail?.toLowerCase()).filter(Boolean)));
      
      return (
        <div className="db-panel-card animate-fadeIn">
          <div className="panel-card-header text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 className="panel-card-title"><FileText size={20} className="text-primary" /> Diagnostic Lab Reports Directory</h3>
              <p className="panel-card-subtitle">Manage, view, and upload laboratory biomarker diagnostics for active patients.</p>
            </div>
            <button 
              onClick={() => {
                if (patientEmails.length === 0) {
                  alert("No active patient appointments found to upload reports for.");
                  return;
                }
                const firstApp = appointments.find(a => a.patientEmail);
                setReportPatientEmail(firstApp?.patientEmail || "");
                setReportPatientName(firstApp?.patientName || "");
                setReportTestName("Complete Blood Count (CBC)");
                setReportBiomarkers([{ parameter: "Hemoglobin", value: "14.0", unit: "g/dL", referenceRange: "13.0 - 17.0", status: "Normal" }]);
                setShowUploadReportModal(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Upload Lab Report
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            {patientEmails.length === 0 ? (
              <div className="empty-panel-state">
                <FileText size={48} className="empty-state-icon" />
                <h4>No Connected Patients</h4>
                <p>Once you consult patients, you will be able to review and upload their lab results here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {patientEmails.map((email) => {
                  const patientApps = appointments.filter(a => a.patientEmail?.toLowerCase() === email);
                  const patientName = patientApps[0]?.patientName || email;
                  const reports = doctorLabReports[email] || [];
                  
                  return (
                    <div key={email} className="doctor-patient-reports-section text-left" style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', background: 'var(--bg-white)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', color: 'var(--text-dark)' }}>{patientName}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email: {email}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setReportPatientEmail(email);
                            setReportPatientName(patientName);
                            setReportTestName("Complete Blood Count (CBC)");
                            setReportBiomarkers([{ parameter: "Hemoglobin", value: "14.0", unit: "g/dL", referenceRange: "13.0 - 17.0", status: "Normal" }]);
                            setShowUploadReportModal(true);
                          }}
                          className="btn btn-sm btn-outline"
                        >
                          <Plus size={12} /> Add Report
                        </button>
                      </div>

                      {reports.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>No uploaded lab reports found for this patient.</p>
                      ) : (
                        <div className="db-table-wrapper" style={{ overflowX: 'auto' }}>
                          <table className="db-table">
                            <thead>
                              <tr>
                                <th>Report ID</th>
                                <th>Diagnostic Test</th>
                                <th>Date Released</th>
                                <th>Attending Doctor</th>
                                <th>Biomarkers</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reports.map((report) => (
                                <tr key={report.id || report._id}>
                                  <td className="font-mono" style={{ fontSize: '0.78rem' }}>{report.id ? report.id.substring(0, 10) : 'N/A'}</td>
                                  <td><strong>{report.testName}</strong></td>
                                  <td>{report.date}</td>
                                  <td>{report.doctorName}</td>
                                  <td>
                                    <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '50px', fontWeight: '600' }}>
                                      {report.results?.length || 0} biomarkers
                                    </span>
                                  </td>
                                  <td>
                                    <span className="status-pill status-completed" style={{ fontSize: '0.74rem' }}>
                                      {report.status}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => setSelectedReportForDetails(report)}
                                      className="btn-download-record"
                                      style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                                    >
                                      <Eye size={12} /> View Sheet
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
                })}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="db-panel-card animate-fadeIn">
          <div className="panel-card-header text-left">
            <h3 className="panel-card-title"><FileText size={20} className="text-primary" /> Diagnostic Lab Reports</h3>
            <p className="panel-card-subtitle">Review your blood chemistry, lipid metrics, and hormonal diagnostic profiles.</p>
          </div>

          {labReports.length === 0 ? (
            <div className="empty-panel-state">
              <FileText size={48} className="empty-state-icon" />
              <h4>No Lab Reports Available</h4>
              <p>Reports will populate here automatically as your clinical tests are completed.</p>
            </div>
          ) : (
            <div className="db-table-wrapper" style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Diagnostic Test</th>
                    <th>Date Released</th>
                    <th>Attending Doctor</th>
                    <th>Metrics Scanned</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {labReports.map((report) => (
                    <tr key={report.id || report._id}>
                      <td className="font-mono">{report.id ? report.id.substring(0, 10) : 'N/A'}</td>
                      <td><strong>{report.testName}</strong></td>
                      <td>{report.date}</td>
                      <td>{report.doctorName}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '50px', fontWeight: '600' }}>
                          {report.results?.length || 0} biomarkers
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-completed" style={{ fontSize: '0.74rem' }}>
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedReportForDetails(report)}
                          className="btn-download-record"
                          style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                        >
                          <Eye size={12} /> View Report Sheet
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
    }
  };

  // 2. Vitals Panel
  const renderVitalsTab = () => {
    const hrValues = [72, 75, 68, 80, 74, 70, 72];
    const bpSystolic = [120, 122, 118, 125, 121, 119, 120];
    const bpDiastolic = [80, 82, 78, 85, 81, 79, 80];

    return (
      <div className="db-panel-card animate-fadeIn">
        <div className="panel-card-header text-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="panel-card-title"><Heart size={20} className="text-primary" /> Live Vitals & Health Metrics</h3>
            <p className="panel-card-subtitle">Real-time stats from your latest clinical screening and checkups.</p>
          </div>
          <div className="vitals-chart-controls">
            <button 
              className={`btn btn-sm ${vitalsChartMetric === 'hr' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVitalsChartMetric('hr')}
              style={{ marginRight: '8px' }}
            >
              Heart Rate Trend
            </button>
            <button 
              className={`btn btn-sm ${vitalsChartMetric === 'bp' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setVitalsChartMetric('bp')}
            >
              Blood Pressure Trend
            </button>
          </div>
        </div>

        <div className="vitals-stats-grid">
          <div className="vital-widget-box pulse-card">
            <div className="vital-widget-top">
              <span className="vital-widget-label">Heart Rate</span>
              <Heart size={22} className="vital-icon text-red animate-pulse" />
            </div>
            <div className="vital-widget-value">72 <span className="vital-unit">bpm</span></div>
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

        {/* --- INTERACTIVE SVG CHART CARD --- */}
        <div className="vitals-chart-card mt-6 text-left">
          <h4 className="chart-card-title" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: "750", color: "var(--text-dark)" }}>
            {vitalsChartMetric === 'hr' ? 'Heart Rate Analytics (Last 7 Days)' : 'Blood Pressure Trend (Last 7 Days)'}
          </h4>
          <div className="chart-svg-container" style={{ position: 'relative', marginTop: '16px' }}>
            <svg viewBox="0 0 600 220" width="100%" height="100%" className="vitals-svg-canvas">
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="bpSysGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              {vitalsChartMetric === 'hr' ? (
                <>
                  <text x="15" y="25" fill="#94a3b8" fontSize="10" textAnchor="middle">100</text>
                  <text x="15" y="75" fill="#94a3b8" fontSize="10" textAnchor="middle">83</text>
                  <text x="15" y="125" fill="#94a3b8" fontSize="10" textAnchor="middle">66</text>
                  <text x="15" y="175" fill="#94a3b8" fontSize="10" textAnchor="middle">50</text>
                </>
              ) : (
                <>
                  <text x="15" y="25" fill="#94a3b8" fontSize="10" textAnchor="middle">140</text>
                  <text x="15" y="75" fill="#94a3b8" fontSize="10" textAnchor="middle">113</text>
                  <text x="15" y="125" fill="#94a3b8" fontSize="10" textAnchor="middle">86</text>
                  <text x="15" y="175" fill="#94a3b8" fontSize="10" textAnchor="middle">60</text>
                </>
              )}

              {/* X Axis Labels */}
              {dates.map((d, i) => (
                <text key={i} x={40 + i * 90} y="195" fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {d}
                </text>
              ))}

              {/* Render dynamic metric paths */}
              {vitalsChartMetric === 'hr' ? (
                <>
                  {/* HR Area Fill */}
                  <path 
                    d="M 40 104 L 130 95 L 220 116 L 310 80 L 400 98 L 490 110 L 580 104 L 580 170 L 40 170 Z" 
                    fill="url(#hrGrad)" 
                  />
                  {/* HR Stroke Path */}
                  <path 
                    d="M 40 104 L 130 95 L 220 116 L 310 80 L 400 98 L 490 110 L 580 104" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* HR Dot Nodes */}
                  {hrValues.map((val, i) => {
                    const x = 40 + i * 90;
                    const y = [104, 95, 116, 80, 98, 110, 104][i];
                    return (
                      <g key={i} className="chart-node-group">
                        <circle cx={x} cy={y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <text x={x} y={y - 12} fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* BP Systolic Area Fill */}
                  <path 
                    d="M 40 57.5 L 130 53.75 L 220 61.25 L 310 48.125 L 400 55.625 L 490 59.375 L 580 57.5 L 580 170 L 40 170 Z" 
                    fill="url(#bpSysGrad)" 
                  />
                  {/* BP Systolic Line */}
                  <path 
                    d="M 40 57.5 L 130 53.75 L 220 61.25 L 310 48.125 L 400 55.625 L 490 59.375 L 580 57.5" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* BP Diastolic Line */}
                  <path 
                    d="M 40 132.5 L 130 128.75 L 220 136.25 L 310 123.125 L 400 130.625 L 490 134.375 L 580 132.5" 
                    fill="none" 
                    stroke="#0ea5e9" 
                    strokeWidth="2.5" 
                    strokeDasharray="4,4" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* BP Systolic Dots */}
                  {bpSystolic.map((val, i) => {
                    const x = 40 + i * 90;
                    const y = [57.5, 53.75, 61.25, 48.125, 55.625, 59.375, 57.5][i];
                    return (
                      <g key={`sys-${i}`} className="chart-node-group">
                        <circle cx={x} cy={y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                        <text x={x} y={y - 10} fill="#2563eb" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    );
                  })}
                  {/* BP Diastolic Dots */}
                  {bpDiastolic.map((val, i) => {
                    const x = 40 + i * 90;
                    const y = [132.5, 128.75, 136.25, 123.125, 130.625, 134.375, 132.5][i];
                    return (
                      <g key={`dia-${i}`} className="chart-node-group">
                        <circle cx={x} cy={y} r="5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
                        <text x={x} y={y + 16} fill="#0ea5e9" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
          <div className="chart-legend-box" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            {vitalsChartMetric === 'hr' ? (
              <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span> Pulse Rate (BPM)</span>
            ) : (
              <>
                <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#2563eb' }}></span> Systolic (BP Max)</span>
                <span className="legend-item"><span className="legend-dot" style={{ backgroundColor: '#0ea5e9' }}></span> Diastolic (BP Min)</span>
              </>
            )}
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
  };

  // 3. Medical Records Panel
  const renderRecordsTab = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const displayTodayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
      <div className="records-tab-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* SECTION 1: PRESCRIPTIONS & DAILY PILLBOX TRACKER */}
        <div className="db-panel-card text-left">
          <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="panel-card-title"><Clock size={20} className="text-primary" /> Daily Pillbox Tracker & Prescriptions</h3>
              <p className="panel-card-subtitle">Stay on track with your daily medication log for <strong>{displayTodayDate}</strong>.</p>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="empty-panel-state">
              <Heart size={48} className="empty-state-icon" style={{ color: "var(--text-light)" }} />
              <h4>No Active Prescriptions</h4>
              <p>You don't have any prescriptions issued by your doctors yet. Confirm appointments to receive daily pill tracking.</p>
            </div>
          ) : (
            <div className="pillbox-grid-layout">
              {/* Prescriptions List & Pill Checks */}
              <div className="pillbox-left-pane">
                {prescriptions.map((rx) => {
                  const totalMeds = rx.medicines.length;
                  const takenMeds = rx.medicines.filter(med => 
                    rx.takenLogs?.includes(`${todayStr}:${med.name}`)
                  ).length;
                  
                  return (
                    <div key={rx.id || rx._id} className="prescription-tracker-card">
                      <div className="rx-card-header">
                        <div>
                          <h4>Prescription from {rx.doctorName || 'Attending Doctor'}</h4>
                          <span>Issued on {rx.date}</span>
                        </div>
                        <span className="status-pill status-active">Active</span>
                      </div>
                      
                      {/* Checkoff Checklist */}
                      <div className="rx-medicine-checklist">
                        {rx.medicines.map((med, idx) => {
                          const logKey = `${todayStr}:${med.name}`;
                          const isTaken = rx.takenLogs?.includes(logKey) || false;
                          
                          return (
                            <div key={idx} className="medicine-checklist-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isTaken}
                                  onChange={(e) => handlePillboxToggle(rx.id, logKey, e.target.checked)}
                                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                                />
                                <div>
                                  <strong style={{ fontSize: '0.88rem', color: isTaken ? 'var(--text-light)' : 'var(--text-dark)', textDecoration: isTaken ? 'line-through' : 'none' }}>{med.name}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dosage: {med.dosage} | Instructions: {med.instructions}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--primary-color)', backgroundColor: 'rgba(30, 64, 175, 0.08)', padding: '2px 8px', borderRadius: '50px' }}>
                                {med.duration}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary Pane */}
              <div className="pillbox-right-pane">
                <h4>Daily Adherence Goal</h4>
                
                {/* Visual Progress Ring */}
                {(() => {
                  const totalAll = prescriptions.reduce((acc, rx) => acc + rx.medicines.length, 0);
                  const takenAll = prescriptions.reduce((acc, rx) => 
                    acc + rx.medicines.filter(med => rx.takenLogs?.includes(`${todayStr}:${med.name}`)).length, 0
                  );
                  const totalProgress = totalAll > 0 ? Math.round((takenAll / totalAll) * 100) : 0;
                  
                  const radius = 55;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (totalProgress / 100) * circumference;
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                      <div className="progress-ring-container">
                        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                          <circle 
                            cx="65" cy="65" r={radius} 
                            fill="transparent" 
                            stroke="#e2e8f0" 
                            strokeWidth="10" 
                          />
                          <circle 
                            cx="65" cy="65" r={radius} 
                            fill="transparent" 
                            stroke={totalProgress === 100 ? '#10b981' : 'var(--primary-color)'} 
                            strokeWidth="10" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset} 
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.35s' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: '850', color: 'var(--text-dark)' }}>{totalProgress}%</span>
                          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 'bold' }}>Taken</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: totalProgress === 100 ? '#10b981' : 'var(--text-dark)' }}>
                          {totalProgress === 100 ? 'All Meds Taken!' : `${takenAll} of ${totalAll} completed`}
                        </h5>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '4px' }}>
                          {totalProgress === 100 
                            ? 'Great job keeping up with your schedule today!' 
                            : 'Mark the remaining medicines once you take them.'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: LABORATORY DIAGNOSTIC REPORTS */}
        <div className="db-panel-card text-left">
          <div className="panel-card-header">
            <h3 className="panel-card-title"><FileText size={20} className="text-primary" /> Diagnostic Lab Reports</h3>
            <p className="panel-card-subtitle">Review your blood chemistry, lipid metrics, and hormonal diagnostic profiles.</p>
          </div>

          {labReports.length === 0 ? (
            <div className="empty-panel-state">
              <FileText size={48} className="empty-state-icon" />
              <h4>No Lab Reports Available</h4>
              <p>Reports will populate here automatically as your clinical tests are completed.</p>
            </div>
          ) : (
            <div className="db-table-wrapper">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Diagnostic Test</th>
                    <th>Date Released</th>
                    <th>Attending Doctor</th>
                    <th>Metrics Scanned</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {labReports.map((report) => (
                    <tr key={report.id || report._id}>
                      <td className="font-mono">{report.id ? report.id.substring(0, 10) : 'N/A'}</td>
                      <td><strong>{report.testName}</strong></td>
                      <td>{report.date}</td>
                      <td>{report.doctorName}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '50px', fontWeight: '600' }}>
                          {report.results?.length || 0} biomarkers
                        </span>
                      </td>
                      <td>
                        <span className="status-pill status-completed" style={{ fontSize: '0.74rem' }}>
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedReportForDetails(report)}
                          className="btn-download-record"
                          style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                        >
                          <Eye size={12} /> View Report Sheet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  const renderSettingsTab = () => {
    const isDoctor = activeUser.role === 'doctor';
    return (
      <div className="db-panel-card">
        <div className="panel-card-header">
          <h3 className="panel-card-title"><Settings size={20} className="text-primary" /> Profile Settings & Preferences</h3>
          <p className="panel-card-subtitle">
            {isDoctor 
              ? "Modify your professional medical credentials, consulting details, hospital branch, and profile bio."
              : "Modify your personal contact details, health demographics, and account profile."}
          </p>
        </div>

        {updateSuccess && (
          <div className="settings-success-alert mb-6">
            <CheckCircle size={16} /> <span>Your profile metrics have been updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSettingsSubmit} className="db-settings-form">
          {isDoctor ? (
            <>
              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-name">Full Doctor Name <span className="req">*</span></label>
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
                  <label htmlFor="settings-specialty">Specialty / Field <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                    placeholder="e.g. Cardiologist, Orthopedic Surgeon"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-exp">Experience (e.g., 10 yrs) <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-exp"
                    value={formData.exp}
                    onChange={(e) => setFormData(prev => ({ ...prev, exp: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-fee">Consultation Fee <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-fee"
                    value={formData.fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-hospital">Hospital Name <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-timing">Weekly Timings <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-timing"
                    value={formData.timingToday}
                    onChange={(e) => setFormData(prev => ({ ...prev, timingToday: e.target.value }))}
                    required
                    placeholder="e.g. 9:00 AM - 5:00 PM"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-schedule">Weekly Schedule <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-schedule"
                    value={formData.weeklySchedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklySchedule: e.target.value }))}
                    required
                    placeholder="e.g. Monday - Friday"
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-education">Education / Credentials <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-education"
                    value={formData.education}
                    onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    required
                    placeholder="e.g. MBBS, MD"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-languages">Spoken Languages <span className="req">*</span></label>
                  <input
                    type="text"
                    id="settings-languages"
                    value={formData.languages}
                    onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
                    required
                    placeholder="e.g. English, Hindi"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-clinicName">Clinic Suite / Room</label>
                  <input
                    type="text"
                    id="settings-clinicName"
                    value={formData.clinicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                    placeholder="e.g. Suite 404, Building B"
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-consultationType">Consultation Mode</label>
                  <select
                    id="settings-consultationType"
                    value={formData.consultationType}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultationType: e.target.value }))}
                  >
                    <option value="Both">Both (Online & In-Person)</option>
                    <option value="Online">Online / Video Call Only</option>
                    <option value="In-Person">In-Person Only</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-statusText">Practice Status</label>
                  <select
                    id="settings-statusText"
                    value={formData.statusText}
                    onChange={(e) => setFormData(prev => ({ ...prev, statusText: e.target.value }))}
                  >
                    <option value="Active & Available">Active & Available</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Emergency Only">Emergency Only</option>
                  </select>
                </div>
              </div>

              <div className="form-input-group">
                <label htmlFor="settings-bio">Biography / Description</label>
                <textarea
                  id="settings-bio"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell patients about your medical background..."
                />
              </div>
            </>
          ) : (
            <>
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

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-height">Height (e.g., 175 cm)</label>
                  <input
                    type="text"
                    id="settings-height"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g. 175 cm"
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-weight">Weight (e.g., 70 kg)</label>
                  <input
                    type="text"
                    id="settings-weight"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g. 70 kg"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-allergies">Allergies</label>
                  <input
                    type="text"
                    id="settings-allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="e.g. Peanuts, Penicillin (None if none)"
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="settings-conditions">Chronic Conditions</label>
                  <input
                    type="text"
                    id="settings-conditions"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, chronicConditions: e.target.value }))}
                    placeholder="e.g. Asthma, Hypertension (None if none)"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-input-group">
                  <label htmlFor="settings-emergency">Emergency Contact Details</label>
                  <input
                    type="text"
                    id="settings-emergency"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="e.g. Jane Doe (Spouse) - +1 555-0199"
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label htmlFor="settings-address">Residential Address</label>
                <textarea
                  id="settings-address"
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your primary residential address details..."
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-save-settings mt-2">
            <Check size={16} /> Save Changes
          </button>
        </form>
      </div>
    );
  };

  // 6. Doctors Tab Panel
  const renderDoctorsTab = () => (
    <div className="db-panel-card">
      <div className="panel-card-header">
        <h3 className="panel-card-title"><User size={20} className="text-primary" /> Consult Our Specialists</h3>
        <p className="panel-card-subtitle">Browse through our certified medical specialists, check real-time availability, and request a consultation session.</p>
      </div>

      <div className="doctors-list-grid">
        {doctorsList.length === 0 ? (
          <div className="empty-panel-state">
            <User size={48} className="empty-state-icon animate-pulse" />
            <h4>No Doctors Available</h4>
            <p>We are currently updating our specialist roster. Please check back shortly.</p>
          </div>
        ) : (
          doctorsList.map((doc) => {
            const isOnline = doc.isOnline === true || doc.isOnline === 'true' || doc.isOnline === undefined;
            return (
              <div key={doc._id || doc.id} className="db-doctor-card">
                <div className="db-doc-header">
                  <div className="db-doc-avatar">
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="db-doc-meta">
                    <span className={`status-indicator ${isOnline ? 'status-confirmed' : 'status-rejected'}`} style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'inline-block', marginBottom: '4px' }}>
                      {isOnline ? 'Available (Online)' : 'Offline'}
                    </span>
                    <h4>{doc.name}</h4>
                    <p className="doc-specialty">{doc.specialty}</p>
                  </div>
                </div>

                <div className="db-doc-body">
                  <div className="db-doc-stat">
                    <span className="label">Experience:</span>
                    <span className="val">{doc.exp || doc.experience || '10 Years'}</span>
                  </div>
                  <div className="db-doc-stat">
                    <span className="label">Hospital:</span>
                    <span className="val">{doc.hospital || 'MedCare Hospital'}</span>
                  </div>
                  <div className="db-doc-stat">
                    <span className="label">Consultation Fee:</span>
                    <span className="val highlight-fee">{doc.fee || '₹500'}</span>
                  </div>
                </div>

                <div className="db-doc-footer">
                  <button 
                    onClick={() => setSelectedDoctorForDetails(doc)}
                    className="btn-view-details"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => onOpenAppointment(doc)}
                    className="btn btn-primary btn-sm"
                    disabled={!isOnline}
                    style={{ opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'not-allowed' }}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`db-layout-root ${activeUser.role === 'doctor' ? 'theme-doctor' : 'theme-patient'}`}>

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
            {activeUser.role === 'doctor' && (
              <div className="doctor-status-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-label-text">Status:</span>
                <button 
                  onClick={handleToggleStatus} 
                  className={`btn-toggle-status ${isDoctorOnline ? 'is-online' : 'is-offline'}`}
                >
                  <span className="toggle-dot"></span>
                  <span className="toggle-text">{isDoctorOnline ? 'Live / Online' : 'Offline'}</span>
                </button>
              </div>
            )}
            {activeUser.role !== 'doctor' && (
              <button onClick={onOpenAppointment} className="btn-db-action-primary">
                <Plus size={16} />
                <span>Book Appointment</span>
              </button>
            )}
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
              <span className="profile-role-badge">
                {activeUser.role === 'doctor' ? `Doctor ID: ${activeUser.id || 'D-101'}` : `Patient ID: #${(activeUser.id || '').substring((activeUser.id || '').length - 6)}`}
              </span>

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

            {activeUser.role !== 'doctor' && (
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
            )}

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
                <span className="metric-title">{activeUser.role === 'doctor' ? 'Total Requests' : 'Total Appointments'}</span>
                <span className="metric-value">{userAppointments.length}</span>
              </div>

              <div className="metric-box highlighted-metric">
                <span className="metric-title">{activeUser.role === 'doctor' ? 'Next Patient' : 'Next Scheduled'}</span>
                <span className="metric-value">
                  {upcomingAppointment 
                    ? (activeUser.role === 'doctor' ? upcomingAppointment.patientName : upcomingAppointment.appointDate) 
                    : 'None'}
                </span>
                {upcomingAppointment && (
                  <span className="metric-subtitle">
                    {activeUser.role === 'doctor' 
                      ? `on ${upcomingAppointment.appointDate} at ${upcomingAppointment.appointTime}` 
                      : `at ${upcomingAppointment.appointTime} - ${upcomingAppointment.department}`}
                  </span>
                )}
              </div>
            </div>

            {/* Active view component renders dynamically here */}
            {activeTab === 'appointments' && renderAppointmentsTab()}
            {activeTab === 'patients' && renderDoctorPatientsTab()}
            {activeTab === 'prescriptions' && renderDoctorPrescriptionsTab()}
            {activeTab === 'analytics' && renderDoctorAnalyticsTab()}
            {activeTab === 'labreports' && renderLabReportsTab()}
            {activeTab === 'doctors' && renderDoctorsTab()}
            {activeTab === 'vitals' && renderVitalsTab()}
            {activeTab === 'records' && renderRecordsTab()}
            {activeTab === 'billing' && renderBillingTab()}
            {activeTab === 'settings' && renderSettingsTab()}

          </div>
        </div>
      </div>

      {/* C. DOCTOR DETAILS MODAL */}
      {selectedDoctorForDetails && (
        <div className="modal-overlay" onClick={() => setSelectedDoctorForDetails(null)}>
          <div className="modal-content doctor-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedDoctorForDetails(null)} aria-label="Close Modal">
              <XCircle size={20} />
            </button>

            <div className="modal-header">
              <div className="doc-details-header-layout">
                <div className="avatar-circle-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {selectedDoctorForDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedDoctorForDetails.name}</h3>
                  <p className="doc-specialty-highlight">{selectedDoctorForDetails.specialty}</p>
                </div>
              </div>
            </div>

            <div className="modal-body text-left">
              <div className="doctor-details-grid-layout">
                <div className="doc-detail-section">
                  <h5>About Doctor</h5>
                  <p className="doc-bio">{selectedDoctorForDetails.bio || 'Dedicated clinical practitioner offering consulting, comprehensive treatments, and wellness care.'}</p>
                </div>

                <div className="doc-detail-section">
                  <h5>Professional Background</h5>
                  <div className="details-info-table">
                    <div className="info-row">
                      <span className="info-label">Education:</span>
                      <span className="info-value">{selectedDoctorForDetails.education || 'MBBS'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Experience:</span>
                      <span className="info-value">{selectedDoctorForDetails.exp || selectedDoctorForDetails.experience || '10 Years'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">License Number:</span>
                      <span className="info-value">{selectedDoctorForDetails.license || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Languages:</span>
                      <span className="info-value">{selectedDoctorForDetails.languages || 'English, Hindi'}</span>
                    </div>
                  </div>
                </div>

                <div className="doc-detail-section">
                  <h5>Hospital & Timings</h5>
                  <div className="details-info-table">
                    <div className="info-row">
                      <span className="info-label">Hospital:</span>
                      <span className="info-value">{selectedDoctorForDetails.hospital || 'MedCare Hospital'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Weekly Availability:</span>
                      <span className="info-value">
                        {selectedDoctorForDetails.timingToday || '9:00 AM - 5:00 PM'} ({selectedDoctorForDetails.weeklySchedule || 'Monday - Friday'})
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Consultation Fee:</span>
                      <span className="info-value font-highlight" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{selectedDoctorForDetails.fee || '₹500'}</span>
                    </div>
                    {selectedDoctorForDetails.clinicName && (
                      <div className="info-row">
                        <span className="info-label">Clinic Suite:</span>
                        <span className="info-value">{selectedDoctorForDetails.clinicName}</span>
                      </div>
                    )}
                    {selectedDoctorForDetails.consultationType && (
                      <div className="info-row">
                        <span className="info-label">Consultation Mode:</span>
                        <span className="info-value">{selectedDoctorForDetails.consultationType}</span>
                      </div>
                    )}
                    {selectedDoctorForDetails.statusText && (
                      <div className="info-row">
                        <span className="info-label">Practice Status:</span>
                        <span className="info-value" style={{ fontWeight: '700', color: selectedDoctorForDetails.statusText.includes('Leave') ? '#ef4444' : '#10b981' }}>{selectedDoctorForDetails.statusText}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Current Status:</span>
                      <span className={`status-indicator ${(selectedDoctorForDetails.isOnline === true || selectedDoctorForDetails.isOnline === 'true' || selectedDoctorForDetails.isOnline === undefined) ? 'status-confirmed' : 'status-rejected'}`}>
                        {(selectedDoctorForDetails.isOnline === true || selectedDoctorForDetails.isOnline === 'true' || selectedDoctorForDetails.isOnline === undefined) ? 'Online (Available)' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedDoctorForDetails(null)}>
                Close Details
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const doc = selectedDoctorForDetails;
                  setSelectedDoctorForDetails(null);
                  onOpenAppointment(doc);
                }}
                disabled={!(selectedDoctorForDetails.isOnline === true || selectedDoctorForDetails.isOnline === 'true' || selectedDoctorForDetails.isOnline === undefined)}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Report Print / Details Sheet Modal */}
      {selectedReportForDetails && (
        <div className="modal-overlay" onClick={() => setSelectedReportForDetails(null)}>
          <div className="modal-content lab-report-print-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', width: '95%' }}>
            <button className="modal-close-btn no-print" onClick={() => setSelectedReportForDetails(null)} aria-label="Close Modal">
              <XCircle size={20} />
            </button>

            <div className="modal-header" style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '850', color: 'var(--primary-color)', margin: 0 }}>MedCare Laboratories</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Suite 404, Hospital Block, City Medical Center</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '50px', fontWeight: 'bold' }}>OFFICIAL DIAGNOSTIC SHEET</span>
                </div>
              </div>
            </div>

            <div className="modal-body text-left" style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div>
                  <div style={{ marginBottom: '6px', fontSize: '0.82rem' }}><span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Patient Name:</span> <span style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{selectedReportForDetails.patientName}</span></div>
                  <div style={{ fontSize: '0.82rem' }}><span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Patient Email:</span> <span style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{selectedReportForDetails.patientEmail}</span></div>
                </div>
                <div>
                  <div style={{ marginBottom: '6px', fontSize: '0.82rem' }}><span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Date Released:</span> <span style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{selectedReportForDetails.date}</span></div>
                  <div style={{ marginBottom: '6px', fontSize: '0.82rem' }}><span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Attending Doctor:</span> <span style={{ color: 'var(--text-dark)', fontWeight: 'bold' }}>{selectedReportForDetails.doctorName}</span></div>
                  <div style={{ fontSize: '0.82rem' }}><span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Report ID:</span> <span className="font-mono" style={{ color: 'var(--text-dark)' }}>{selectedReportForDetails.id || selectedReportForDetails._id}</span></div>
                </div>
              </div>

              <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                Test: {selectedReportForDetails.testName}
              </h4>

              <div className="db-table-wrapper">
                <table className="db-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Parameter / Biomarker</th>
                      <th style={{ textAlign: 'center' }}>Value</th>
                      <th style={{ textAlign: 'center' }}>Unit</th>
                      <th style={{ textAlign: 'center' }}>Reference Range</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReportForDetails.results?.map((res, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: 'left', fontWeight: '700', color: '#1e293b' }}>{res.parameter}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: res.status !== 'Normal' ? '#ef4444' : '#1e293b' }}>{res.value}</td>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{res.unit}</td>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{res.referenceRange}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-pill ${
                            res.status === 'Normal' ? 'status-confirmed' : 'status-rejected'
                          }`} style={{ fontSize: '0.74rem' }}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Computer generated report - No signature required.</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>MedCare Hospital Systems</span>
              </div>
            </div>

            <div className="modal-footer no-print" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedReportForDetails(null)}>
                Close Window
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Download size={14} /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Lab Report Modal */}
      {showUploadReportModal && (
        <div className="modal-overlay" onClick={() => setShowUploadReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setShowUploadReportModal(false)} aria-label="Close Modal">
              <XCircle size={20} />
            </button>

            <div className="modal-header">
              <h3>Upload Patient Lab Report</h3>
              <p>Enter test biomarkers and diagnostics to save to the patient record.</p>
            </div>

            <div className="modal-body text-left">
              <form onSubmit={handleSaveLabReport} className="modal-form">
                <div className="form-group">
                  <label>Select Patient <span className="req">*</span></label>
                  <select 
                    value={reportPatientEmail} 
                    onChange={(e) => {
                      const email = e.target.value;
                      setReportPatientEmail(email);
                      const matchingApp = appointments.find(a => a.patientEmail?.toLowerCase() === email.toLowerCase());
                      setReportPatientName(matchingApp?.patientName || "");
                    }}
                    required
                  >
                    <option value="" disabled>-- Select Connected Patient --</option>
                    {Array.from(new Set(appointments.map(a => a.patientEmail?.toLowerCase()).filter(Boolean))).map(email => {
                      const matchingApp = appointments.find(a => a.patientEmail?.toLowerCase() === email);
                      return (
                        <option key={email} value={email}>
                          {matchingApp?.patientName || email} ({email})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Diagnostic Test Name <span className="req">*</span></label>
                  <input 
                    type="text" 
                    value={reportTestName} 
                    onChange={(e) => setReportTestName(e.target.value)} 
                    placeholder="e.g. Lipid Profile, Complete Blood Count" 
                    required 
                  />
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>Biomarkers & Results</h5>
                    <button 
                      type="button" 
                      onClick={handleAddBiomarkerRow}
                      className="btn btn-sm btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      <Plus size={12} /> Add Biomarker
                    </button>
                  </div>

                  {reportBiomarkers.map((res, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        value={res.parameter} 
                        onChange={(e) => handleBiomarkerChange(idx, "parameter", e.target.value)} 
                        placeholder="Hemoglobin" 
                        required 
                        style={{ fontSize: '0.8rem', padding: '6px' }}
                      />
                      <input 
                        type="text" 
                        value={res.value} 
                        onChange={(e) => handleBiomarkerChange(idx, "value", e.target.value)} 
                        placeholder="14.2" 
                        required 
                        style={{ fontSize: '0.8rem', padding: '6px' }}
                      />
                      <input 
                        type="text" 
                        value={res.unit} 
                        onChange={(e) => handleBiomarkerChange(idx, "unit", e.target.value)} 
                        placeholder="g/dL" 
                        style={{ fontSize: '0.8rem', padding: '6px' }}
                      />
                      <input 
                        type="text" 
                        value={res.referenceRange} 
                        onChange={(e) => handleBiomarkerChange(idx, "referenceRange", e.target.value)} 
                        placeholder="13.0 - 17.0" 
                        style={{ fontSize: '0.8rem', padding: '6px' }}
                      />
                      <select 
                        value={res.status} 
                        onChange={(e) => handleBiomarkerChange(idx, "status", e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '6px' }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveBiomarkerRow(idx)}
                        disabled={reportBiomarkers.length <= 1}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowUploadReportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Upload Lab Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
