// =================================================================
// MEDCARE BACKEND EXPRESS SERVER WITH MONGODB
// =================================================================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Create our Express server application
const app = express();

// CONFIGURE MIDDLEWARE
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/DEMO")
    .then(() => {
        console.log("-----------------------------------------");
        console.log("✅ Successfully connected to MongoDB database.");
        console.log("-----------------------------------------");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });

// DATABASE SCHEMAS & MODELS
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    age: { type: Number, default: 0 },
    gender: { type: String, default: "Male" },
    bloodGroup: { type: String, default: "O+" },
    role: { type: String, default: "patient" }
});

const AppointmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    patientId: { type: String },
    doctorId: { type: String },
    patientName: { type: String },
    patientEmail: { type: String },
    doctorName: { type: String },
    date: { type: String },
    time: { type: String },
    type: { type: String },
    status: { type: String },
    reason: { type: String },
    department: { type: String },
    appointDate: { type: String },
    appointTime: { type: String },
    additionalNotes: { type: String }
}, { strict: false });

const User = mongoose.model("User", UserSchema);
const Appointment = mongoose.model("Appointment", AppointmentSchema);

const PrescriptionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    appointmentId: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientName: { type: String },
    doctorEmail: { type: String, required: true },
    doctorName: { type: String },
    date: { type: String },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String },
        duration: { type: String },
        instructions: { type: String }
    }],
    takenLogs: { type: [String], default: [] }
});

const MessageSchema = new mongoose.Schema({
    senderEmail: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    senderName: { type: String },
    receiverName: { type: String },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const LabReportSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    patientEmail: { type: String, required: true },
    patientName: { type: String },
    doctorName: { type: String },
    testName: { type: String, required: true },
    date: { type: String },
    status: { type: String, default: "Completed" },
    results: [{
        parameter: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        status: { type: String, default: "Normal" }
    }],
    isCritical: { type: Boolean, default: false }
});

const Prescription = mongoose.model("Prescription", PrescriptionSchema);
const Message = mongoose.model("Message", MessageSchema);
const LabReport = mongoose.model("LabReport", LabReportSchema);

// =================================================================
// API ENDPOINTS / ROUTES
// =================================================================

// --- ROUTE A: USER SIGNUP (REGISTER NEW ACCOUNT) ---
app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing fields. Please enter name, email, and password." });
    }
    
    try {
        const emailLower = email.toLowerCase();
        const userExists = await User.findOne({ email: emailLower });
        if (userExists) {
            return res.status(400).json({ error: "An account with this email address already exists." });
        }
        
        const newUser = new User({
            ...req.body,
            id: "u_" + Date.now(),
            email: emailLower
        });
        
        await newUser.save();

        // Create doctor or patient entry if needed
        const db = mongoose.connection.db;
        if (newUser.role === "doctor") {
            const newDocId = "D-" + Math.floor(100 + Math.random() * 900);
            await db.collection("doctors").insertOne({
                user: newUser._id,
                id: newDocId,
                name: newUser.name,
                email: newUser.email,
                specialty: "General Medicine",
                exp: "10 yrs",
                fee: "₹500",
                license: "MCI-" + Math.floor(20000 + Math.random() * 70000),
                hospital: "City Medical Center",
                rating: 5,
                status: "Active",
                isOnline: true,
                timingToday: "9:00 AM - 5:00 PM",
                weeklySchedule: "Monday - Friday",
                education: "MBBS",
                bio: "Dedicated medical specialist.",
                languages: "English, Hindi"
            });
        } else {
            const newPatientId = "P-" + Math.floor(10000 + Math.random() * 90000);
            await db.collection("patients").insertOne({
                user: newUser._id,
                id: newPatientId,
                name: newUser.name,
                email: newUser.email,
                age: newUser.age || 0,
                gender: newUser.gender || "Male",
                bloodType: newUser.bloodGroup || "O+",
                height: "",
                weight: "",
                chronicConditions: "",
                allergies: "",
                emergencyContact: "",
                address: ""
            });
        }
        
        const response = newUser.toObject();
        delete response.password;
        delete response._id;
        delete response.__v;
        
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error during registration: " + err.message });
    }
});

// --- ROUTE B: USER LOGIN (AUTHENTICATE) ---
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email and password." });
    }
    
    try {
        const user = await User.findOne({ email: email.toLowerCase(), password });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password. Please try again." });
        }
        
        const response = user.toObject();
        delete response.password;
        
        // Fetch patient or doctor custom details (like D-101 or P-10421) to attach to user
        const db = mongoose.connection.db;
        if (response.role === "doctor") {
            let doctorDoc = await db.collection("doctors").findOne({ email: email.toLowerCase() });
            if (!doctorDoc) {
                const newDocId = "D-" + Math.floor(100 + Math.random() * 900);
                const insertResult = await db.collection("doctors").insertOne({
                    user: user._id,
                    id: newDocId,
                    name: user.name,
                    email: user.email,
                    specialty: "General Medicine",
                    exp: "10 yrs",
                    fee: "₹500",
                    license: "MCI-" + Math.floor(20000 + Math.random() * 70000),
                    hospital: "City Medical Center",
                    rating: 5,
                    status: "Active",
                    isOnline: true,
                    timingToday: "9:00 AM - 5:00 PM",
                    weeklySchedule: "Monday - Friday",
                    education: "MBBS",
                    bio: "Dedicated medical specialist.",
                    languages: "English, Hindi"
                });
                doctorDoc = await db.collection("doctors").findOne({ _id: insertResult.insertedId });
            }
            response.id = doctorDoc.id;
            response.doctorDetails = doctorDoc;
        } else {
            let patientDoc = await db.collection("patients").findOne({ email: email.toLowerCase() });
            if (!patientDoc) {
                const newPatientId = "P-" + Math.floor(10000 + Math.random() * 90000);
                const insertResult = await db.collection("patients").insertOne({
                    user: user._id,
                    id: newPatientId,
                    name: user.name,
                    email: user.email,
                    age: user.age || 0,
                    gender: user.gender || "Male",
                    bloodType: user.bloodGroup || "O+",
                    height: "",
                    weight: "",
                    chronicConditions: "",
                    allergies: "",
                    emergencyContact: "",
                    address: ""
                });
                patientDoc = await db.collection("patients").findOne({ _id: insertResult.insertedId });
            }
            response.id = patientDoc.id;
            response.patientDetails = patientDoc;
        }
        
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error during login: " + err.message });
    }
});

// --- ROUTE C: GET APPOINTMENTS ---
app.get("/api/appointments", async (req, res) => {
    const { email } = req.query;
    
    try {
        const db = mongoose.connection.db;
        
        // Find user by email to determine role
        let userDoc = null;
        if (email) {
            userDoc = await db.collection("users").findOne({ email: email.toLowerCase() });
        }
        
        const pipeline = [
            {
                $lookup: {
                    from: "patients",
                    localField: "patient",
                    foreignField: "_id",
                    as: "patientData"
                }
            },
            {
                $lookup: {
                    from: "doctors",
                    localField: "doctor",
                    foreignField: "_id",
                    as: "doctorData"
                }
            }
        ];
        
        if (userDoc && userDoc.role === "doctor") {
            // Find the doctor document in doctors collection
            const doctorDoc = await db.collection("doctors").findOne({ email: email.toLowerCase() });
            if (doctorDoc) {
                pipeline.push({
                    $match: {
                        doctor: doctorDoc._id
                    }
                });
            } else {
                return res.json([]);
            }
        } else if (email) {
            // Default to patient match
            pipeline.push({
                $match: {
                    "patientData.email": email.toLowerCase()
                }
            });
        }
        
        const list = await Appointment.aggregate(pipeline);
        const response = list.map(item => {
            const obj = { ...item };
            
            // Map 'date' to 'appointDate' and 'time' to 'appointTime' if they exist in DB
            if (obj.date && !obj.appointDate) obj.appointDate = obj.date;
            if (obj.time && !obj.appointTime) obj.appointTime = obj.time;
            
            // Map type or reason to department for display
            if (!obj.department) obj.department = obj.type || obj.reason || "General Consult";
            
            // Ensure patientEmail is populated so existing logic/filters don't fail
            if (obj.patientData && obj.patientData.length > 0) {
                obj.patientEmail = obj.patientData[0].email;
            } else if (email) {
                obj.patientEmail = email.toLowerCase();
            }
            
            // Also keep id or map _id to id if not present
            if (!obj.id && obj._id) obj.id = String(obj._id);
            
            return obj;
        });
        
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving appointments: " + err.message });
    }
});

// --- ROUTE D: BOOK NEW APPOINTMENT ---
app.post("/api/appointments", async (req, res) => {
    const { patientName, patientEmail, appointDate, appointTime, doctorId } = req.body;
    
    if (!patientName || !patientEmail || !appointDate || !appointTime) {
        return res.status(400).json({ error: "Missing fields. Please make sure name, email, date and time are provided." });
    }
    
    try {
        const db = mongoose.connection.db;
        
        // Find corresponding patient document
        let patientDoc = await db.collection("patients").findOne({ email: patientEmail.toLowerCase() });
        if (!patientDoc) {
            // Proactively create patient record if they exist as a user but not a patient
            const userDoc = await db.collection("users").findOne({ email: patientEmail.toLowerCase() });
            const newPatientId = "P-" + Math.floor(10000 + Math.random() * 90000);
            
            const insertResult = await db.collection("patients").insertOne({
                user: userDoc ? userDoc._id : new mongoose.Types.ObjectId(),
                id: newPatientId,
                name: patientName,
                email: patientEmail.toLowerCase(),
                age: 0,
                gender: "Male",
                bloodType: "O+",
                height: "",
                weight: "",
                chronicConditions: "",
                allergies: ""
            });
            patientDoc = await db.collection("patients").findOne({ _id: insertResult.insertedId });
        }
        
        // Find corresponding doctor document
        let doctorDoc = null;
        if (doctorId) {
            if (mongoose.Types.ObjectId.isValid(doctorId)) {
                doctorDoc = await db.collection("doctors").findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
            } else {
                doctorDoc = await db.collection("doctors").findOne({ id: doctorId });
            }
        }

        if (doctorDoc && doctorDoc.isOnline === false) {
            return res.status(400).json({ error: `${doctorDoc.name} is currently offline. You cannot book an appointment with this doctor.` });
        }
        
        const newApp = new Appointment({
            ...req.body,
            id: "A-" + Math.floor(500 + Math.random() * 500),
            patient: patientDoc ? patientDoc._id : undefined,
            patientId: patientDoc ? patientDoc.id : undefined,
            doctor: doctorDoc ? doctorDoc._id : undefined,
            doctorId: doctorDoc ? doctorDoc.id : undefined,
            doctorName: doctorDoc ? doctorDoc.name : undefined,
            date: appointDate,
            time: appointTime,
            status: "Pending"
        });
        
        await newApp.save();
        res.status(201).json(newApp);
    } catch (err) {
        res.status(500).json({ error: "Server error booking appointment: " + err.message });
    }
});

// --- ROUTE E: CANCEL APPOINTMENT ---
app.delete("/api/appointments/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        let deleted = await Appointment.findOneAndDelete({ id });
        if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Appointment.findByIdAndDelete(id);
        }
        if (!deleted) {
            return res.status(404).json({ error: "Appointment not found." });
        }
        res.json({ message: "Appointment cancelled successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error cancelling appointment: " + err.message });
    }
});

// --- ROUTE F: UPDATE USER PROFILE DETAILS ---
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const db = mongoose.connection.db;
        
        // Bulletproof lookup by id/ObjectId/email/patientId/doctorId
        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ id });
        }
        if (!user && id.includes("@")) {
            user = await User.findOne({ email: id.toLowerCase() });
        }
        
        let patientDoc = null;
        if (!user) {
            patientDoc = await db.collection("patients").findOne({ id });
            if (!patientDoc) {
                patientDoc = await db.collection("patients").findOne({ email: id.toLowerCase() });
            }
            if (patientDoc) {
                user = await User.findById(patientDoc.user);
                if (!user) {
                    user = await User.findOne({ email: patientDoc.email.toLowerCase() });
                }
            }
        }
        
        if (!user) {
            // Also try doctor custom id
            const doctorDoc = await db.collection("doctors").findOne({ id });
            if (doctorDoc) {
                user = await User.findById(doctorDoc.user);
                if (!user) {
                    user = await User.findOne({ email: doctorDoc.email.toLowerCase() });
                }
            }
        }
        
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }
        
        // Merge updates from body
        const updates = req.body;
        
        // Exclude sensitive fields from bulk update
        delete updates.email; 
        delete updates.id;
        delete updates.password;
        
        // Update user fields
        Object.assign(user, updates);
        await user.save();
        
        if (user.role === 'patient') {
            if (!patientDoc) {
                patientDoc = await db.collection("patients").findOne({ email: user.email.toLowerCase() });
            }
            if (!patientDoc) {
                // Proactively create patient record if it was missing
                const newPatientId = "P-" + Math.floor(10000 + Math.random() * 90000);
                await db.collection("patients").insertOne({
                    user: user._id,
                    id: newPatientId,
                    name: user.name,
                    email: user.email,
                    age: user.age || 0,
                    gender: user.gender || "Male",
                    bloodType: user.bloodGroup || "O+",
                    height: updates.height || "",
                    weight: updates.weight || "",
                    chronicConditions: updates.chronicConditions || "",
                    allergies: updates.allergies || "",
                    emergencyContact: updates.emergencyContact || "",
                    address: updates.address || ""
                });
                patientDoc = await db.collection("patients").findOne({ email: user.email.toLowerCase() });
            } else {
                const patientUpdates = {
                    name: user.name,
                    phone: user.phone,
                    age: user.age,
                    gender: user.gender,
                    bloodType: user.bloodGroup,
                    height: updates.height !== undefined ? updates.height : patientDoc.height,
                    weight: updates.weight !== undefined ? updates.weight : patientDoc.weight,
                    chronicConditions: updates.chronicConditions !== undefined ? updates.chronicConditions : patientDoc.chronicConditions,
                    allergies: updates.allergies !== undefined ? updates.allergies : patientDoc.allergies,
                    emergencyContact: updates.emergencyContact !== undefined ? updates.emergencyContact : patientDoc.emergencyContact,
                    address: updates.address !== undefined ? updates.address : patientDoc.address
                };
                await db.collection("patients").updateOne(
                    { _id: patientDoc._id },
                    { $set: patientUpdates }
                );
                patientDoc = await db.collection("patients").findOne({ _id: patientDoc._id });
            }
        }
        
        const response = user.toObject();
        delete response.password;
        delete response._id;
        delete response.__v;
        
        if (user.role === 'patient' && patientDoc) {
            response.id = patientDoc.id;
            response.patientDetails = patientDoc;
        }
        
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error updating user profile: " + err.message });
    }
});

// --- ROUTE G: GET ALL DOCTORS ---
app.get("/api/doctors", async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const list = await db.collection("doctors").find({}).toArray();
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving doctors: " + err.message });
    }
});

// --- ROUTE H: UPDATE APPOINTMENT STATUS (CONFIRM/REJECT) ---
app.put("/api/appointments/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: "Status field is required." });
    }
    
    try {
        // Find appointment by either id or _id
        let appDoc = await Appointment.findOne({ id });
        if (!appDoc && mongoose.Types.ObjectId.isValid(id)) {
            appDoc = await Appointment.findById(id);
        }
        
        if (!appDoc) {
            return res.status(404).json({ error: "Appointment not found." });
        }
        
        appDoc.status = status;
        await appDoc.save();
        
        res.json({ message: `Appointment status updated to ${status} successfully.`, appointment: appDoc });
    } catch (err) {
        res.status(500).json({ error: "Server error updating appointment status: " + err.message });
    }
});

// --- ROUTE I: UPDATE DOCTOR DETAILS ---
app.put("/api/doctors/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
        const db = mongoose.connection.db;
        let doctorDoc = await db.collection("doctors").findOne({ id });
        if (!doctorDoc && mongoose.Types.ObjectId.isValid(id)) {
            doctorDoc = await db.collection("doctors").findOne({ _id: new mongoose.Types.ObjectId(id) });
        }
        if (!doctorDoc) {
            doctorDoc = await db.collection("doctors").findOne({ email: id.toLowerCase() });
        }
        
        if (!doctorDoc) {
            return res.status(404).json({ error: "Doctor profile not found." });
        }
        
        // Exclude _id, user fields if sent
        delete updates._id;
        delete updates.user;
        
        await db.collection("doctors").updateOne(
            { _id: doctorDoc._id },
            { $set: updates }
        );
        
        // Sync name/email to User collection if changed
        if (updates.name || updates.email) {
            const userUpdate = {};
            if (updates.name) userUpdate.name = updates.name;
            if (updates.email) userUpdate.email = updates.email.toLowerCase();
            await User.updateOne(
                { email: doctorDoc.email.toLowerCase() },
                { $set: userUpdate }
            );
        }
        
        const updatedDoctor = await db.collection("doctors").findOne({ _id: doctorDoc._id });
        res.json({ message: "Doctor profile updated successfully.", doctorDetails: updatedDoctor });
    } catch (err) {
        res.status(500).json({ error: "Server error updating doctor profile: " + err.message });
    }
});

// --- ROUTE J: CREATE PRESCRIPTION (DOCTOR) ---
app.post("/api/prescriptions", async (req, res) => {
    const { appointmentId, patientEmail, patientName, doctorEmail, doctorName, medicines } = req.body;
    
    if (!appointmentId || !patientEmail || !doctorEmail || !medicines) {
        return res.status(400).json({ error: "Missing required prescription fields." });
    }
    
    try {
        const newPrescription = new Prescription({
            id: "pr_" + Date.now(),
            appointmentId,
            patientEmail: patientEmail.toLowerCase(),
            patientName,
            doctorEmail: doctorEmail.toLowerCase(),
            doctorName,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            medicines,
            takenLogs: []
        });
        
        await newPrescription.save();
        res.status(201).json({ message: "Prescription created successfully.", prescription: newPrescription });
    } catch (err) {
        res.status(500).json({ error: "Server error creating prescription: " + err.message });
    }
});

// --- ROUTE K: GET PRESCRIPTIONS ---
app.get("/api/prescriptions", async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: "Email query parameter is required." });
    }
    
    try {
        const emailLower = email.toLowerCase();
        const list = await Prescription.find({
            $or: [
                { patientEmail: emailLower },
                { doctorEmail: emailLower }
            ]
        }).sort({ _id: -1 });
        
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving prescriptions: " + err.message });
    }
});

// --- ROUTE L: LOG PILLBOX (TAKEN STATUS) ---
app.put("/api/prescriptions/:id/take", async (req, res) => {
    const { id } = req.params;
    const { date, taken } = req.body;
    
    try {
        const prescription = await Prescription.findOne({ id });
        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found." });
        }
        
        if (taken) {
            if (!prescription.takenLogs.includes(date)) {
                prescription.takenLogs.push(date);
            }
        } else {
            prescription.takenLogs = prescription.takenLogs.filter(d => d !== date);
        }
        
        await prescription.save();
        res.json({ message: "Pillbox log updated.", prescription });
    } catch (err) {
        res.status(500).json({ error: "Server error logging pillbox: " + err.message });
    }
});

// --- ROUTE L2: DELETE/CANCEL PRESCRIPTION ---
app.delete("/api/prescriptions/:id", async (req, res) => {
    const { id } = req.params;
    try {
        let deleted = await Prescription.findOneAndDelete({ id });
        if (!deleted && mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Prescription.findByIdAndDelete(id);
        }
        if (!deleted) {
            return res.status(404).json({ error: "Prescription not found." });
        }
        res.json({ message: "Prescription deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: "Server error deleting prescription: " + err.message });
    }
});

// --- ROUTE M: SEND MESSAGE ---
app.post("/api/messages", async (req, res) => {
    const { senderEmail, receiverEmail, senderName, receiverName, text } = req.body;
    
    if (!senderEmail || !receiverEmail || !text) {
        return res.status(400).json({ error: "Sender email, receiver email, and text are required." });
    }
    
    try {
        const newMessage = new Message({
            senderEmail: senderEmail.toLowerCase(),
            receiverEmail: receiverEmail.toLowerCase(),
            senderName,
            receiverName,
            text,
            timestamp: new Date()
        });
        
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Server error sending message: " + err.message });
    }
});

// --- ROUTE N: GET MESSAGES ---
app.get("/api/messages", async (req, res) => {
    const { senderEmail, receiverEmail } = req.query;
    
    if (!senderEmail || !receiverEmail) {
        return res.status(400).json({ error: "Both senderEmail and receiverEmail are required." });
    }
    
    try {
        const sEmail = senderEmail.toLowerCase();
        const rEmail = receiverEmail.toLowerCase();
        
        const list = await Message.find({
            $or: [
                { senderEmail: sEmail, receiverEmail: rEmail },
                { senderEmail: rEmail, receiverEmail: sEmail }
            ]
        }).sort({ timestamp: 1 });
        
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving messages: " + err.message });
    }
});

// --- ROUTE O: GET LAB REPORTS (WITH AUTO INITIALIZATION OF DEMO REPORTS) ---
app.get("/api/labreports", async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({ error: "Email query parameter is required." });
    }
    
    try {
        const emailLower = email.toLowerCase();
        let reports = await LabReport.find({ patientEmail: emailLower }).sort({ _id: -1 });
        
        if (reports.length === 0) {
            const mockReports = [
                {
                    id: "lr_cbc_" + Date.now(),
                    patientEmail: emailLower,
                    patientName: "Active Patient",
                    doctorName: "Dr. Mahee",
                    testName: "Complete Blood Count (CBC)",
                    date: "June 15, 2026",
                    status: "Completed",
                    results: [
                        { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRange: "13.0 - 17.0", status: "Normal" },
                        { parameter: "White Blood Cells (WBC)", value: "11.5", unit: "10^3/uL", referenceRange: "4.0 - 11.0", status: "High" },
                        { parameter: "Red Blood Cells (RBC)", value: "4.8", unit: "10^6/uL", referenceRange: "4.5 - 5.9", status: "Normal" },
                        { parameter: "Platelet Count", value: "245", unit: "10^3/uL", referenceRange: "150 - 450", status: "Normal" },
                        { parameter: "Hematocrit", value: "42.5", unit: "%", referenceRange: "40.0 - 50.0", status: "Normal" }
                    ]
                },
                {
                    id: "lr_lipid_" + Date.now(),
                    patientEmail: emailLower,
                    patientName: "Active Patient",
                    doctorName: "Dr. Yadav",
                    testName: "Lipid Profile (Cholesterol)",
                    date: "June 12, 2026",
                    status: "Completed",
                    results: [
                        { parameter: "Total Cholesterol", value: "215", unit: "mg/dL", referenceRange: "< 200", status: "High" },
                        { parameter: "Triglycerides", value: "165", unit: "mg/dL", referenceRange: "< 150", status: "High" },
                        { parameter: "HDL Cholesterol", value: "48", unit: "mg/dL", referenceRange: "> 40", status: "Normal" },
                        { parameter: "LDL Cholesterol", value: "134", unit: "mg/dL", referenceRange: "< 100", status: "High" }
                    ]
                },
                {
                    id: "lr_thyroid_" + Date.now(),
                    patientEmail: emailLower,
                    patientName: "Active Patient",
                    doctorName: "Dr. Mahee",
                    testName: "Thyroid Function Test",
                    date: "May 28, 2026",
                    status: "Completed",
                    results: [
                        { parameter: "TSH (Thyroid Stimulating Hormone)", value: "3.12", unit: "uIU/mL", referenceRange: "0.45 - 4.50", status: "Normal" },
                        { parameter: "Free T3", value: "2.8", unit: "pg/mL", referenceRange: "2.0 - 4.4", status: "Normal" },
                        { parameter: "Free T4", value: "0.75", unit: "ng/dL", referenceRange: "0.82 - 1.77", status: "Low" }
                    ]
                }
            ];
            
            await LabReport.insertMany(mockReports);
            reports = await LabReport.find({ patientEmail: emailLower }).sort({ _id: -1 });
        }
        
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: "Server error retrieving lab reports: " + err.message });
    }
});

// --- ROUTE P: CREATE LAB REPORT (DOCTOR) ---
app.post("/api/labreports", async (req, res) => {
    const { patientEmail, patientName, doctorName, testName, date, results } = req.body;
    
    if (!patientEmail || !testName || !results || !Array.isArray(results)) {
        return res.status(400).json({ error: "Missing required lab report fields." });
    }
    
    try {
        const isCritical = results.some(r => r.status === "High" || r.status === "Low");
        const newReport = new LabReport({
            id: "lr_" + Date.now(),
            patientEmail: patientEmail.toLowerCase(),
            patientName: patientName || "Active Patient",
            doctorName: doctorName || "Attending Doctor",
            testName,
            date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: "Completed",
            results,
            isCritical
        });
        
        await newReport.save();
        res.status(201).json({ message: "Lab report created successfully.", labReport: newReport });
    } catch (err) {
        res.status(500).json({ error: "Server error creating lab report: " + err.message });
    }
});

// =================================================================
// START SERVER
// =================================================================
app.listen(5000, () => {
    console.log("-----------------------------------------");
    console.log("MedCare Express API Server running on port 5000");
    console.log("Ready to accept requests from frontend.");
    console.log("-----------------------------------------");
});