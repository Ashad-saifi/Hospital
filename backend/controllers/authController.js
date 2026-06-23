const User = require("../models/User");
const Doctor = require("../models/Doctor");

// Register a new Doctor
const signup = async (req, res) => {
    const { name, email, password, phone, specialization, experience } = req.body;

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
            id: "u_" + Date.now(),
            name,
            email: emailLower,
            password,
            phone: phone || "",
            role: "doctor" // strictly register as doctor
        });

        await newUser.save();

        // Create the doctor profile record
        const doctorDetails = await Doctor.create({
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone || "0000000000",
            specialization: specialization || "General Medicine",
            experience: experience || 1
        });

        const response = newUser.toObject();
        delete response.password;
        response.doctorDetails = doctorDetails;

        res.status(201).json(response);
    } catch (err) {
        console.error("Signup Error Stack:", err);
        res.status(500).json({ error: "Server error during registration: " + err.message });
    }
};

// Log in Doctor
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide both email and password." });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase(), password });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password. Please try again." });
        }

        // Force role check if we want strictly doctor backend
        if (user.role !== "doctor") {
            return res.status(403).json({ error: "Access denied. Only doctor accounts can access this panel." });
        }

        const response = user.toObject();
        delete response.password;

        let doctorDoc = await Doctor.findOne({ email: response.email });
        if (!doctorDoc) {
            // Auto-create doctor document if missing
            doctorDoc = await Doctor.create({
                name: response.name,
                email: response.email,
                phone: response.phone || "0000000000",
                specialization: "General Medicine",
                experience: 1
            });
        }
        response.doctorDetails = doctorDoc;

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Server error during login: " + err.message });
    }
};

module.exports = {
    signup,
    login
};
