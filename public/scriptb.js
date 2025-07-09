// scriptb.js

// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// --- DOM Elements ---
const bookAppointmentForm = document.getElementById('bookAppointmentForm');
const serviceSelect = document.getElementById('service');
const doctorSelect = document.getElementById('doctor');
const doctorFeesDisplayGroup = document.getElementById('doctorFeesDisplayGroup');
const doctorFeesAmount = document.getElementById('doctorFeesAmount');
const appointmentDateInput = document.getElementById('appointmentDate');

let currentUser = null; // Stores patient data
let allDoctors = []; // To store fetched doctor data including fees

// --- Helper Functions ---

function setMinMaxDateForAppointment() {
    if (appointmentDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const todayString = `${yyyy}-${mm}-${dd}`;
        appointmentDateInput.setAttribute('min', todayString);

        // Optionally set a max date, e.g., 1 year from now
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() + 1);
        const maxYYYY = maxDate.getFullYear();
        let maxMM = maxDate.getMonth() + 1;
        let maxDD = maxDate.getDate();

        if (maxDD < 10) maxDD = '0' + maxDD;
        if (maxMM < 10) maxMM = '0' + maxMM;

        const maxDateString = `${maxYYYY}-${maxMM}-${maxDD}`;
        appointmentDateInput.setAttribute('max', maxDateString);
    }
}

// Fetch doctors and populate the dropdown
async function populateDoctorDropdown() {
    if (!doctorSelect) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("No auth token found. Cannot fetch doctors.");
        doctorSelect.innerHTML = '<option value="">Login to fetch doctors</option>';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/doctors`, { // Assuming this endpoint returns all doctors
            headers: { 'Authorization': `Bearer ${token}` } // If this route is protected
        });
        const doctors = await response.json();

        if (response.ok && Array.isArray(doctors)) {
            allDoctors = doctors; // Store all doctors for later fee lookup
            doctorSelect.innerHTML = '<option value="">Select a Doctor</option>'; // Clear existing options
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor._id; // Use doctor's _id as the value
                option.textContent = `Dr. ${doctor.name} (${doctor.specialty})`;
                doctorSelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch doctors or received non-array data:', doctors);
            doctorSelect.innerHTML = '<option value="">Failed to load doctors</option>';
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
    }
}

// Display doctor's fees when a doctor is selected
function displayDoctorFees() {
    if (!doctorSelect || !doctorFeesDisplayGroup || !doctorFeesAmount) return;

    const selectedDoctorId = doctorSelect.value;
    const selectedDoctor = allDoctors.find(doc => doc._id === selectedDoctorId);

    if (selectedDoctor && typeof selectedDoctor.appointmentFees === 'number') {
        doctorFeesAmount.textContent = `$${selectedDoctor.appointmentFees.toFixed(2)}`;
        doctorFeesDisplayGroup.style.display = 'block'; // Show the fees section
    } else {
        doctorFeesAmount.textContent = 'N/A';
        doctorFeesDisplayGroup.style.display = 'none'; // Hide if no doctor selected or fees not available
    }
}

// --- Form Submission Logic ---
if (bookAppointmentForm) {
    bookAppointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(bookAppointmentForm);
        const service = formData.get('service');
        const doctorId = formData.get('doctor'); // This is the doctor's _id
        const appointmentDate = formData.get('appointmentDate');
        const appointmentTime = formData.get('appointmentTime');
        const notes = formData.get('notes');

        // Basic client-side validation
        if (!service || !doctorId || !appointmentDate || !appointmentTime) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!currentUser || !currentUser._id) {
            alert('Patient not logged in. Please log in to book an appointment.');
            window.location.href = 'index2.html'; // Redirect to patient login
            return;
        }

        // Get the selected doctor's name and fees for the payload
        const selectedDoctor = allDoctors.find(doc => doc._id === doctorId);
        const doctorName = selectedDoctor ? selectedDoctor.name : 'N/A';
        const appointmentFees = selectedDoctor ? selectedDoctor.appointmentFees : 0;


        const payload = {
            patient: currentUser._id, // Patient's ID
            doctor: doctorId, // Doctor's ID
            service,
            date: appointmentDate,
            time: appointmentTime,
            notes,
            status: 'Scheduled', // Default status
            doctorName: doctorName, // Include doctor's name for easier display in patient portal
            appointmentFees: appointmentFees // Include the fees
        };

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${BASE_URL}/api/appointments`, { // Endpoint for adding appointments
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send auth token
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Appointment booked successfully!');
                window.location.href = 'index2.html'; // Redirect back to patient dashboard
            } else {
                alert(data.message || 'Failed to book appointment. Please try again.');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('An error occurred while booking the appointment. Please check your connection.');
        }
    });
}

// --- Initial Load & Authentication Check ---
document.addEventListener('DOMContentLoaded', async () => {
    setMinMaxDateForAppointment(); // Set min/max dates for appointment date input

    const authToken = localStorage.getItem('authToken');
    const patientData = localStorage.getItem('currentLoggedInPatientEmail');

    if (authToken && patientData) {
        // Attempt to re-authenticate as patient
        try {
            const response = await fetch(`${BASE_URL}/api/patients/profile?email=${patientData}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                populateDoctorDropdown(); // Populate doctors once patient is authenticated
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
    } else {
        // No valid session found, redirect to main site or a generic login
        alert('You must be logged in to book an appointment.');
        window.location.href = 'index.html'; // Redirect to main marketing site
    }

    // Add event listener for doctor selection change to display fees
    if (doctorSelect) {
        doctorSelect.addEventListener('change', displayDoctorFees);
    }
});
