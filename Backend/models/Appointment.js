import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  appointDate: {
    type: String,
    required: true
  },
  appointTime: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
