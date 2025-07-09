// scriptr.js (Previously add-report-script.js)

// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// --- DOM Elements ---
const addReportForm = document.getElementById('addReportForm');
const reportPatientIdSelect = document.getElementById('patientId');
const patientIdGroup = document.getElementById('patientIdGroup'); // The div containing patientId select
const reportDateInput = document.getElementById('reportDate');
const reportTypeSelect = document.getElementById('reportType'); // Report Type select
const otherReportTypeGroup = document.getElementById('otherReportTypeGroup'); // Group for 'Other' input
const otherReportTypeInput = document.getElementById('otherReportType'); // 'Other' input field

let currentUser = null; // Can be patient or doctor
let userType = null; // 'patient' or 'doctor'

// --- Helper Functions ---

// Set the minimum date for the report date input to today
function setMinDateForReport() {
    if (reportDateInput) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        reportDateInput.setAttribute('max', today); // Max date should be today or in the past
    }
}

// Populate the patient dropdown for doctors
async function populatePatientDropdown() {
    if (!reportPatientIdSelect) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("No auth token found. Cannot fetch patients.");
        reportPatientIdSelect.innerHTML = '<option value="">Login to fetch patients</option>';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/patients`, { // Assuming /api/patients returns all patients
            headers: { 'Authorization': `Bearer ${token}` } // If this route is protected
        });
        const patients = await response.json();

        if (response.ok && Array.isArray(patients)) {
            reportPatientIdSelect.innerHTML = '<option value="">Select Patient</option>'; // Clear existing options
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient._id; // Use patient's _id as the value
                option.textContent = `${patient.name} (ID: ${patient._id.substring(0, 8)}...)`; // Display name and truncated ID
                reportPatientIdSelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch patients or received non-array data:', patients);
            reportPatientIdSelect.innerHTML = '<option value="">Failed to load patients</option>';
        }
    } catch (error) {
        console.error('Error fetching patients:', error);
        reportPatientIdSelect.innerHTML = '<option value="">Error loading patients</option>';
    }
}

// --- Event Listeners for Report Type Selection ---
if (reportTypeSelect && otherReportTypeGroup && otherReportTypeInput) {
    reportTypeSelect.addEventListener('change', () => {
        if (reportTypeSelect.value === 'Other') {
            otherReportTypeGroup.style.display = 'block'; // Show the input field
            otherReportTypeInput.setAttribute('required', 'true'); // Make it required
        } else {
            otherReportTypeGroup.style.display = 'none'; // Hide the input field
            otherReportTypeInput.removeAttribute('required'); // Remove required attribute
            otherReportTypeInput.value = ''; // Clear its value
        }
    });
}

// --- Form Submission Logic ---
if (addReportForm) {
    addReportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(addReportForm);
        const title = formData.get('title');
        const date = formData.get('date');
        let type = formData.get('type'); // Get selected type
        const summary = formData.get('summary');
        const nextAction = formData.get('nextAction');

        // If 'Other' was selected, use the value from the new input field
        if (type === 'Other') {
            type = formData.get('otherType');
            if (!type || type.trim() === '') {
                alert('Please specify the report type when "Other" is selected.');
                return;
            }
        }

        // Basic client-side validation
        if (!title || !date || !type || !summary) {
            alert('Please fill in all required fields for the report.');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You must be logged in to add a report.');
            // Redirect to login page
            window.location.href = userType === 'doctor' ? 'indexd.html' : 'index2.html';
            return;
        }

        let payload = {
            title,
            date,
            type, // Use the potentially updated type
            summary,
            nextAction,
            status: 'final' // Default status for new reports
        };
        let apiUrl = '';

        if (userType === 'doctor') {
            const patientId = formData.get('patientId');
            if (!patientId) {
                alert('Please select a patient for the report.');
                return;
            }
            payload.patientId = patientId;
            payload.doctorId = currentUser._id;
            apiUrl = `${BASE_URL}/api/doctors/add-report`; // Endpoint for doctors adding reports
        } else if (userType === 'patient') {
            payload.patientId = currentUser._id;
            payload.doctor = 'Self-Reported'; // Indicate it's a self-reported by patient
            apiUrl = `${BASE_URL}/api/patients/add-report`; // Endpoint for patients adding self-reports
        } else {
            alert('Invalid user type. Please log in.');
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send auth token
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Report added successfully!');
                // Redirect back to the appropriate dashboard
                window.location.href = userType === 'doctor' ? 'indexd.html' : 'index2.html';
            } else {
                alert(data.message || 'Failed to add report. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred while adding the report. Please check your connection.');
        }
    });
}

// --- Initial Load & Authentication Check ---
document.addEventListener('DOMContentLoaded', async () => {
    setMinDateForReport(); // Set max date for report date input

    const authToken = localStorage.getItem('authToken');
    const patientData = localStorage.getItem('currentLoggedInPatientEmail');
    const doctorData = localStorage.getItem('currentLoggedInDoctorEmail');

    if (authToken && patientData) {
        // Attempt to re-authenticate as patient
        try {
            const response = await fetch(`${BASE_URL}/api/patients/profile?email=${patientData}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                userType = 'patient';
                if (patientIdGroup) patientIdGroup.style.display = 'none'; // Hide patient selection for patients
            } else {
                console.error('Patient re-auth failed:', response.statusText);
                alert('Session expired or invalid. Please log in again.');
                window.location.href = 'index2.html'; // Redirect to patient login
            }
        } catch (error) {
            console.error('Error during patient re-authentication:', error);
            alert('An error occurred. Please log in again.');
            window.location.href = 'index2.html'; // Redirect to patient login
        }
    } else if (authToken && doctorData) {
        // Attempt to re-authenticate as doctor
        try {
            const response = await fetch(`${BASE_URL}/api/doctors/profile?email=${doctorData}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                userType = 'doctor';
                if (patientIdGroup) patientIdGroup.style.display = 'block'; // Show patient selection for doctors
                populatePatientDropdown(); // Populate dropdown for doctors
            } else {
                console.error('Doctor re-auth failed:', response.statusText);
                alert('Session expired or invalid. Please log in again.');
                window.location.href = 'indexd.html'; // Redirect to doctor login
            }
        } catch (error) {
            console.error('Error during doctor re-authentication:', error);
            alert('An error occurred. Please log in again.');
            window.location.href = 'indexd.html'; // Redirect to doctor login
        }
    } else {
        // No valid session found, redirect to main site or a generic login
        alert('You must be logged in to access this page.');
        window.location.href = 'index.html'; // Redirect to main marketing site
    }
});
