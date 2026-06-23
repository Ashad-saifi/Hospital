const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// MongoDB Connect
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger to debug signup/login
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - Body:`, req.body);
    next();
});

// Test Route
app.get("/", (req, res) => {
    res.send("Hospital Backend is Running...");
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Doctor Routes
app.use("/api/doctors", doctorRoutes);

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});