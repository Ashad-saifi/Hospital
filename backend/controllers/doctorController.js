const Doctor = require("../models/Doctor");

// Create Doctor
const createDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);

        res.status(201).json({
            message: "Doctor created successfully",
            doctor,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get All Doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get Single Doctor By ID
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found",
            });
        }

        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Export
module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
};