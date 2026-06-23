// =================================================================
// MEDCARE API ENDPOINT TEST SCRIPT
// =================================================================
// This script runs in Node.js and tests all our backend API routes.
// It verifies that Signup, Login, Profile Updates, Appointment Booking,
// Retrieval, and Cancellation are all functioning correctly.
//
// How to run:
// 1. Make sure the backend server is running (node backend/server.js).
// 2. Open another terminal and run: node backend/test_api.js
// =================================================================

// The base URL of our local Express API server
const API_URL = "http://localhost:5000/api";

async function runTests() {
    console.log("=========================================");
    console.log("🚀 Starting MedCare API Integration Tests...");
    console.log("=========================================\n");

    let tempUserId = null;
    let tempAppId = null;
    
    // We generate a unique email for each run so there are no conflicts
    const testEmail = `test_patient_${Date.now()}@example.com`;

    // -------------------------------------------------------------
    // TEST 1: PATIENT SIGNUP (POST /api/auth/signup)
    // -------------------------------------------------------------
    try {
        console.log("1️⃣ Testing SIGNUP (Create a new patient account)...");
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Alex Patel",
                email: testEmail,
                password: "securePassword123",
                phone: "+1 555-0144",
                age: 28,
                gender: "Male",
                bloodGroup: "O+"
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Signup request failed.");
        
        tempUserId = data.id; // Store ID for subsequent test steps
        console.log("   ✅ SUCCESS: Account created!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ SIGNUP FAILED:", error.message);
        return; // Stop running test sequence on failure
    }

    // -------------------------------------------------------------
    // TEST 2: PATIENT LOGIN (POST /api/auth/login)
    // -------------------------------------------------------------
    try {
        console.log("2️⃣ Testing LOGIN (Authenticate credentials)...");
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "securePassword123"
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login request failed.");
        
        console.log("   ✅ SUCCESS: Authentication successful!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ LOGIN FAILED:", error.message);
        return;
    }

    // -------------------------------------------------------------
    // TEST 3: UPDATE PROFILE DETAILS (PUT /api/users/:id)
    // -------------------------------------------------------------
    try {
        console.log(`3️⃣ Testing UPDATE PROFILE (Modifying user details for ID: ${tempUserId})...`);
        const response = await fetch(`${API_URL}/users/${tempUserId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Alexander Patel", // Update name
                phone: "+1 555-9999",    // Update phone
                age: 29,                 // Update age
                gender: "Other",         // Update gender
                bloodGroup: "A-"         // Update blood group
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Update request failed.");
        
        console.log("   ✅ SUCCESS: Demographics updated!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ UPDATE PROFILE FAILED:", error.message);
        return;
    }

    // -------------------------------------------------------------
    // TEST 4: BOOK APPOINTMENT (POST /api/appointments)
    // -------------------------------------------------------------
    try {
        console.log("4️⃣ Testing BOOK APPOINTMENT (Create clinical booking)...");
        const response = await fetch(`${API_URL}/appointments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientName: "Alexander Patel",
                patientEmail: testEmail,
                department: "ICU Departments",
                appointDate: "2026-07-10",
                appointTime: "14:15",
                additionalNotes: "Requires general health screening checkup"
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Booking request failed.");
        
        tempAppId = data.id; // Store appointment ID for cancellation test step
        console.log("   ✅ SUCCESS: Appointment scheduled!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ BOOK APPOINTMENT FAILED:", error.message);
        return;
    }

    // -------------------------------------------------------------
    // TEST 5: GET APPOINTMENTS (GET /api/appointments?email=...)
    // -------------------------------------------------------------
    try {
        console.log(`5️⃣ Testing GET APPOINTMENTS (Retrieve bookings for: ${testEmail})...`);
        const response = await fetch(`${API_URL}/appointments?email=${testEmail}`);
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Fetch appointments request failed.");
        
        console.log("   ✅ SUCCESS: Bookings retrieved successfully!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ GET APPOINTMENTS FAILED:", error.message);
        return;
    }

    // -------------------------------------------------------------
    // TEST 6: CANCEL APPOINTMENT (DELETE /api/appointments/:id)
    // -------------------------------------------------------------
    try {
        console.log(`6️⃣ Testing CANCEL APPOINTMENT (Delete booking for ID: ${tempAppId})...`);
        const response = await fetch(`${API_URL}/appointments/${tempAppId}`, {
            method: "DELETE"
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Cancellation request failed.");
        
        console.log("   ✅ SUCCESS: Appointment cancelled!");
        console.log("   👉 Response data:", data);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("   ❌ CANCEL APPOINTMENT FAILED:", error.message);
        return;
    }

    console.log("=========================================");
    console.log("🎉 ALL API ENDPOINT TESTS COMPLETED SUCCESSFULLY!");
    console.log("=========================================");
}

runTests();
