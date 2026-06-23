// =================================================================
// MEDCARE API UTILS
// =================================================================
// This file contains all our frontend helper functions that talk to
// the Express backend server (running at http://localhost:5000/api).
//
// These functions use the standard browser 'fetch()' API to make HTTP requests.
// We use 'async' and 'await' to wait for the server's responses smoothly.
// =================================================================

// 1. BASE URL OF THE SERVER
// This is where our backend server is listening.
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Helper function to handle response errors.
 * If the response is not OK (e.g. status code 400, 401, 404, 500),
 * this function reads the error message from the JSON and throws an error.
 */
async function handleResponse(response) {
    if (!response.ok) {
        // Read the error message sent by backend (e.g. { error: "..." })
        let errorMessage = "Something went wrong";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            // If the server didn't send back valid JSON, fall back to default message
        }
        throw new Error(errorMessage);
    }
    // If response is successful, parse the JSON body and return it
    return await response.json();
}

// =================================================================
// 2. AUTHENTICATION API CALLS
// =================================================================

/**
 * Register a new user account.
 * @param {Object} userData - Contains { name, email, password, phone, age, gender, bloodGroup }
 */
export async function apiSignup(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData) // Convert JavaScript object to text string for transport
    });
    return await handleResponse(response);
}

/**
 * Log in to an existing user account.
 * @param {string} email
 * @param {string} password
 */
export async function apiLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    return await handleResponse(response);
}

// =================================================================
// 3. APPOINTMENTS API CALLS
// =================================================================

/**
 * Fetch list of appointments for a user.
 * @param {string} email - The patient's email address
 */
export async function apiGetAppointments(email) {
    // If email exists, retrieve with query param '?email=...'
    const url = email 
        ? `${API_BASE_URL}/appointments?email=${encodeURIComponent(email)}`
        : `${API_BASE_URL}/appointments`;
        
    const response = await fetch(url, {
        method: "GET" // GET is the default HTTP method to fetch data
    });
    return await handleResponse(response);
}

/**
 * Book a new appointment.
 * @param {Object} appointmentData - Contains { patientName, patientEmail, department, appointDate, appointTime, additionalNotes }
 */
export async function apiBookAppointment(appointmentData) {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
    });
    return await handleResponse(response);
}

/**
 * Cancel an appointment.
 * @param {string} id - The unique appointment ID to cancel
 */
export async function apiCancelAppointment(id) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE" // DELETE method to remove items
    });
    return await handleResponse(response);
}

// =================================================================
// 4. USER PROFILE API CALLS
// =================================================================

/**
 * Update user profile details.
 * @param {string} id - The user's unique ID
 * @param {Object} userData - Contains { name, phone, age, gender, bloodGroup }
 */
export async function apiUpdateProfile(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT", // PUT method to update existing resource
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });
    return await handleResponse(response);
}

/**
 * Fetch all doctors from the backend database.
 */
export async function apiGetDoctors() {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: "GET"
    });
    return await handleResponse(response);
}

/**
 * Update the status of an appointment (e.g. Confirm or Reject).
 * @param {string} id - Appointment ID
 * @param {string} status - New status ("Confirmed" or "Rejected")
 */
export async function apiUpdateAppointmentStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });
    return await handleResponse(response);
}

/**
 * Update doctor profile details.
 * @param {string} id - The doctor's unique custom ID or email
 * @param {Object} doctorData - Contains updated doctor fields
 */
export async function apiUpdateDoctorProfile(id, doctorData) {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(doctorData)
    });
    return await handleResponse(response);
}

/**
 * Fetch prescriptions for a user.
 * @param {string} email
 */
export async function apiGetPrescriptions(email) {
    const response = await fetch(`${API_BASE_URL}/prescriptions?email=${encodeURIComponent(email)}`, {
        method: "GET"
    });
    return await handleResponse(response);
}

/**
 * Create a new prescription.
 * @param {Object} payload - Contains { appointmentId, patientEmail, patientName, doctorEmail, doctorName, medicines }
 */
export async function apiCreatePrescription(payload) {
    const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return await handleResponse(response);
}

/**
 * Delete/cancel a prescription.
 * @param {string} id - The prescription ID to delete
 */
export async function apiDeletePrescription(id) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: "DELETE"
    });
    return await handleResponse(response);
}

/**
 * Log pillbox take action.
 * @param {string} id - Prescription ID
 * @param {string} date - Date in 'YYYY-MM-DD'
 * @param {boolean} taken - True/false status
 */
export async function apiLogPillbox(id, date, taken) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/take`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ date, taken })
    });
    return await handleResponse(response);
}

/**
 * Fetch chat messages between two users.
 * @param {string} senderEmail
 * @param {string} receiverEmail
 */
export async function apiGetMessages(senderEmail, receiverEmail) {
    const response = await fetch(`${API_BASE_URL}/messages?senderEmail=${encodeURIComponent(senderEmail)}&receiverEmail=${encodeURIComponent(receiverEmail)}`, {
        method: "GET"
    });
    return await handleResponse(response);
}

/**
 * Send a chat message.
 * @param {Object} payload - Contains { senderEmail, receiverEmail, senderName, receiverName, text }
 */
export async function apiSendMessage(payload) {
    const response = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return await handleResponse(response);
}

/**
 * Fetch lab reports for a patient.
 * @param {string} email
 */
export async function apiGetLabReports(email) {
    const response = await fetch(`${API_BASE_URL}/labreports?email=${encodeURIComponent(email)}`, {
        method: "GET"
    });
    return await handleResponse(response);
}

/**
 * Create a new lab report (Doctor).
 * @param {Object} payload - Contains { patientEmail, patientName, doctorName, testName, date, results }
 */
export async function apiCreateLabReport(payload) {
    const response = await fetch(`${API_BASE_URL}/labreports`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    return await handleResponse(response);
}

