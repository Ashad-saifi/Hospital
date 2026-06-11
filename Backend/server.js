import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Mongoose Models
import User from './models/User.js';
import Appointment from './models/Appointment.js';

// Configure Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medcare';

// Middleware
app.use(cors({
  origin: '*', // Allows connections from any origin (e.g. your Vite frontend running on any port)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Database.');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

// --- API ROUTES ---

// 1. Root Test Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MedCare Hospital API is running smoothly.' });
});

// 2. User Sign Up (Registration)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, bloodGroup } = req.body;

    // Validation checks
    if (!name || !email || !password || !phone || !age) {
      return res.status(400).json({ error: 'All mandatory fields must be filled.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Create new User document
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Note: In production, hash passwords using bcrypt
      phone,
      age: parseInt(age, 10),
      gender,
      bloodGroup
    });

    await newUser.save();
    
    // Convert to JSON and remove password from output
    const userResponse = newUser.toObject();
    delete userResponse.password;

    console.log('User signed up successfully:', userResponse.email);
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 3. User Log In (Authentication)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('User logged in successfully:', userResponse.email);
    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 4. Update Profile
app.put('/api/users/profile', async (req, res) => {
  try {
    const { email, name, phone, age, gender, bloodGroup } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'User email is required to locate record.' });
    }

    // Find and update user in database
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        name, 
        phone, 
        age: parseInt(age, 10), 
        gender, 
        bloodGroup 
      },
      { new: true } // Returns the newly updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    console.log('Profile updated successfully:', userResponse.email);
    res.json(userResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error during profile update.' });
  }
});

// 5. Get Appointments (Filtered by patient email)
app.get('/api/appointments', async (req, res) => {
  try {
    const { email } = req.query;

    let query = {};
    if (email) {
      query.patientEmail = email.toLowerCase();
    }

    const appointments = await Appointment.find(query).sort({ appointDate: 1, appointTime: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to retrieve appointments.' });
  }
});

// 6. Book Appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientName, patientEmail, department, appointDate, appointTime, additionalNotes } = req.body;

    if (!patientName || !patientEmail || !appointDate || !appointTime) {
      return res.status(400).json({ error: 'Mandatory fields are missing.' });
    }

    const newAppointment = new Appointment({
      patientName,
      patientEmail: patientEmail.toLowerCase(),
      department,
      appointDate,
      appointTime,
      additionalNotes
    });

    await newAppointment.save();

    console.log('New appointment created in MongoDB:', newAppointment._id);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to request appointment.' });
  }
});

// 7. Cancel Appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedApp = await Appointment.findByIdAndDelete(id);
    if (!deletedApp) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    console.log('Appointment deleted from MongoDB:', id);
    res.json({ message: 'Appointment cancelled successfully.', id });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
