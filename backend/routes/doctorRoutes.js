const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getAllDoctors,
} = require("../controllers/doctorController");

router.post("/", createDoctor);
router.get("/", getAllDoctors);

module.exports = router;