// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// Authentication state
let currentUser = null; // Stores user data upon successful login

// DOM elements (Ensuring they exist before accessing)
const authSection = document.getElementById('authSection');
const mainDashboard = document.getElementById('mainDashboard');
// Using the correct IDs for login/register forms as per your index2.html
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const logoutButton = document.getElementById('logoutButton');

// Dashboard Patient Info Elements
const patientNameElement = document.getElementById('patientName');
const patientIdDisplay = document.getElementById('patientIdDisplay');
const patientEmailDisplay = document.getElementById('patientEmail'); // Corrected ID from patientEmailDisplay
const patientPhoneDisplay = document.getElementById('patientPhoneDisplay');
const patientDOBDisplay = document.getElementById('patientDOBDisplay'); // Corrected ID from patientDobDisplay
const patientGenderDisplay = document.getElementById('patientGenderDisplay');
// Assuming you have an element for patient address on the dashboard, otherwise it's only in the modal.
// const patientAddressDisplay = document.getElementById('patientAddressDisplay');

// Dashboard Stats Elements
const upcomingAppointmentsElement = document.getElementById('upcomingAppointments');
const totalReportsElement = document.getElementById('totalReports');
const lastVisitDateElement = document.getElementById('lastVisitDate'); // Your existing ID
const nextAppointmentDateElement = document.getElementById('nextAppointmentDate'); // Your existing ID

// Dashboard Content Lists
const appointmentsList = document.getElementById('appointmentsList');
const noAppointmentsMessage = document.getElementById('noAppointmentsMessage');
const appointmentsCountSpan = document.getElementById('appointmentsCount'); // Renamed from appointmentCount for consistency
const reportsList = document.getElementById('reportsList');
const noReportsMessage = document.getElementById('noReportsMessage');
const reportsCountSpan = document.getElementById('reportsCount'); // Renamed from reportsCount for consistency
const searchInput = document.getElementById('searchInput');

// Report Image Modal Elements
const reportImageModal = document.getElementById('reportImageModal');
const reportImageDisplay = document.getElementById('reportImageDisplay');

// --- Appointment Booking Modal DOM Elements (NEW/UPDATED) ---
const bookingModal = document.getElementById('bookingModal');
const bookingForm = document.getElementById('bookingForm');
const formSteps = document.querySelectorAll('#bookingForm .form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Input fields in Step 1 of booking modal (to be pre-filled)
const bookingFirstName = document.getElementById('firstName');
const bookingLastName = document.getElementById('lastName');
const bookingEmail = document.getElementById('email');
const bookingPhone = document.getElementById('phone');
const bookingAddress = document.getElementById('address');

// Summary content element for Step 3
const summaryContent = document.getElementById('summaryContent');

let currentStep = 0; // State for multi-step form


// --- Helper Functions ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    try {
        // Ensure date is parsed correctly across browsers, especially if it's just 'YYYY-MM-DD'
        // Using `new Date(dateString + 'T00:00:00Z')` can help for consistent UTC interpretation
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        console.error('Invalid date string for formatting:', dateString, e);
        return dateString;
    }
}

// Helper to format date for display in the specific "Month Day, Year" format
function formatAppointmentDateForDisplay(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString + 'T00:00:00'); // Treat as local date without timezone issues
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        console.error('Invalid date string for formatting:', dateString, e);
        return dateString;
    }
}


function getReportIcon(type) {
    switch (type) {
        case 'Laboratory': return '<i class="fas fa-flask"></i>';
        case 'Radiology': return '<i class="fas fa-x-ray"></i>';
        case 'Cardiology': return '<i class="fas fa-heartbeat"></i>';
        case 'General': return '<i class="fas fa-file-medical"></i>'; // Added general type
        default: return '<i class="fas fa-file-alt"></i>';
    }
}

// --- Authentication event listeners ---
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        if (loginFormElement) loginFormElement.classList.remove('active');
        if (registerFormElement) registerFormElement.classList.add('active');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        if (registerFormElement) registerFormElement.classList.remove('active');
        if (loginFormElement) loginFormElement.classList.add('active');
    });
}

// --- Login Logic (Backend Integration) ---
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try {
                // IMPORTANT: Clone the response BEFORE attempting to read its body (json or text)
                // This prevents "body stream already read" error if parsing fails and you try to read again
                const responseClone = response.clone();
                data = await response.json();
            } catch (jsonError) {
                console.error('Login: Error parsing JSON response (likely server-side error):', jsonError);
                const rawText = await response.text(); // Read original response as text
                console.error('Login: Raw non-JSON response from server:', rawText);
                alert('An unexpected server response occurred during login. Please check console for details.');
                return; // Stop execution here as response is not usable
            }

            if (response.ok) {
                currentUser = data.patient; // Store patient data
                localStorage.setItem('authToken', data.token); // Store token
                localStorage.setItem('currentLoggedInPatientEmail', email); // Store email for re-auth
                console.log('Patient login successful:', currentUser);
                showDashboard();
                if (loginFormElement) loginFormElement.reset();
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error (network or uncaught):', error);
            alert('An error occurred during login. Please try again later.');
        }
    });
}

// --- Registration Logic (Backend Integration) ---
if (registerFormElement) {
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const phoneInput = document.getElementById('registerPhone');
        const dobInput = document.getElementById('registerDOB'); // Corrected from 'registerDob'
        const genderInput = document.getElementById('registerGender');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const phone = phoneInput ? phoneInput.value : '';
        const dob = dobInput ? dobInput.value : '';
        const gender = genderInput ? genderInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        // Validate form
        if (!name || !email || !phone || !dob || !gender || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/patients/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send dateOfBirth and gender
                body: JSON.stringify({ name, email, phone, dateOfBirth: dob, gender, password }),
            });

            let data;
            try {
                // Clone the response BEFORE attempting to read its body
                const responseClone = response.clone();
                data = await response.json();
            } catch (jsonError) {
                console.error('Registration: Error parsing JSON response (likely server-side error):', jsonError);
                const rawText = await response.text(); // Read original response as text
                console.error('Registration: Raw non-JSON response from server:', rawText);
                alert('An unexpected server response occurred during registration. Please check console for details.');
                return; // Stop execution here
            }

            if (response.ok) {
                alert('Account created successfully! Please log in.');
                if (loginFormElement) loginFormElement.classList.add('active');
                if (registerFormElement) registerFormElement.classList.remove('active');
                if (registerFormElement) registerFormElement.reset();
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error (network or uncaught):', error);
            alert('An error occurred during registration. Please try again later.');
        }
    });
}

// --- Logout Logic ---
function logout() {
    currentUser = null;
    localStorage.removeItem('authToken'); // Clear auth token
    localStorage.removeItem('currentLoggedInPatientEmail'); // Clear mock login state
    if (authSection) authSection.style.display = 'flex';
    if (mainDashboard) mainDashboard.style.display = 'none';
    if (loginFormElement) loginFormElement.reset();
    if (registerFormElement) registerFormElement.reset();
    if (searchInput) searchInput.value = ''; // Clear search input
    // Reload the page to ensure a clean state (optional, but good for cleanliness)
    window.location.reload();
}

if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}

// --- UI Display Functions ---
function showAuth() {
    if (authSection) authSection.style.display = 'flex';
    if (mainDashboard) mainDashboard.style.display = 'none';
    // Ensure login form is active by default when showing auth
    if (loginFormElement) loginFormElement.classList.add('active');
    if (registerFormElement) registerFormElement.classList.remove('active');
}

async function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'block'; // Or 'flex' if you prefer for your layout

    if (currentUser) {
        if (patientNameElement) patientNameElement.textContent = currentUser.name || 'Patient';
        // if (dashboardWelcomeText) dashboardWelcomeText.textContent = `Welcome, ${currentUser.name || 'Patient'}!`; // No dashboardWelcomeText in your index2.html

        // Update other patient details
        if (patientIdDisplay) patientIdDisplay.textContent = `ID: ${currentUser._id ? currentUser._id.substring(0, 8).toUpperCase() : 'N/A'}`; // Use _id for MongoDB ID
        if (patientDOBDisplay) patientDOBDisplay.textContent = `DOB: ${formatDate(currentUser.dateOfBirth || currentUser.dob) || 'N/A'}`;
        if (patientPhoneDisplay) patientPhoneDisplay.textContent = currentUser.phone || 'N/A';
        if (patientEmailDisplay) patientEmailDisplay.textContent = currentUser.email || 'N/A';
        // if (patientAddressDisplay) patientAddressDisplay.textContent = currentUser.address || 'N/A'; // No element for this in index2.html
        if (patientGenderDisplay) patientGenderDisplay.textContent = `Gender: ${currentUser.gender || 'N/A'}`;
    }

    await initializeDashboardContent();
}

// --- Dashboard Data Fetching and Rendering (from Backend) ---
async function initializeDashboardContent() {
    if (!currentUser || !currentUser._id) {
        console.error("No current user or user ID available for dashboard data.");
        showAuth();
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn("No auth token found for dashboard data. Please log in.");
        showAuth();
        return;
    }

    let appointments = []; // Initialize as empty array
    let reports = [];     // Initialize as empty array

    try {
        // --- Fetch Appointments ---
        // Your backend endpoint for patient appointments should be /api/appointments/patient/:patientId
        const appointmentsResponse = await fetch(`${BASE_URL}/api/appointments/patient/${currentUser._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const appointmentsResponseClone = appointmentsResponse.clone(); // Clone for potential second read

        let appointmentsData;
        try {
            appointmentsData = await appointmentsResponse.json();
        } catch (jsonError) {
            console.error('Dashboard: Error parsing Appointments JSON response. This means backend sent non-JSON data:', jsonError);
            const rawText = await appointmentsResponseClone.text(); // Use the clone here
            console.error('Dashboard: Raw Appointments response (from backend):', rawText.substring(0, 500)); // Log first 500 chars
            throw new Error(`Failed to parse appointments data from server. Raw response starts with: "${rawText.substring(0, 50)}..."`);
        }

        if (appointmentsResponse.ok && Array.isArray(appointmentsData)) {
            appointments = appointmentsData;
            renderAppointments(appointments);
        } else {
            console.error('Dashboard: Failed to fetch appointments or received non-array data:', appointmentsData);
            renderAppointments([]); // Render empty list if data is not as expected
        }

        // --- Fetch Reports ---
        const reportsResponse = await fetch(`${BASE_URL}/api/patients/reports/${currentUser._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportsResponseClone = reportsResponse.clone(); // Clone for potential second read

        let reportsData;
        try {
            reportsData = await reportsResponse.json();
        } catch (jsonError) {
            console.error('Dashboard: Error parsing Reports JSON response. This means backend sent non-JSON data:', jsonError);
            const rawText = await reportsResponseClone.text(); // Use the clone here
            console.error('Dashboard: Raw Reports response (from backend):', rawText.substring(0, 500)); // Log first 500 chars
            throw new Error(`Failed to parse reports data from server. Raw response starts with: "${rawText.substring(0, 50)}..."`);
        }

        if (reportsResponse.ok && Array.isArray(reportsData)) {
            reports = reportsData;
            renderReports(reports);
        } else {
            console.error('Dashboard: Failed to fetch reports or received non-array data:', reportsData);
            renderReports([]); // Render empty list if data is not as expected
        }

        // Pass the guaranteed-to-be-arrays to setupSearch
        setupSearch(appointments, reports);
        setupTabs();
        updateStats(appointments, reports);

        // --- NEW: Initialize Appointment Booking Modal Logic ---
        setupAppointmentBookingModal(); // Call this after currentUser is set and DOM is ready

    } catch (error) {
        console.error('Error initializing dashboard content (overall fetch process):', error);
        alert('Failed to load dashboard data. Please try refreshing or logging in again. Check browser console for specific server message.');
        // Optionally, force logout if dashboard data cannot be loaded consistently
        // logout();
    }
}


function renderAppointments(appointments) {
    if (!appointmentsList || !appointmentsCountSpan || !noAppointmentsMessage) return;

    appointmentsCountSpan.textContent = `${appointments.length} appointments`;

    if (appointments.length === 0) {
        appointmentsList.innerHTML = ''; // Clear any previous appointments
        noAppointmentsMessage.style.display = 'block'; // Show "No appointments found" message
        return;
    }

    noAppointmentsMessage.style.display = 'none'; // Hide "No appointments found" message
    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="appointment-card">
            <h3>${appointment.service || 'General Consultation'} with ${appointment.doctor || 'Any Doctor'}</h3>
            <p><strong>Date:</strong> ${formatAppointmentDateForDisplay(appointment.appointmentDate) || 'N/A'}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime || 'N/A'}</p>
            <p><strong>Status:</strong> ${appointment.status || 'Scheduled'}</p>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        </div>
    `).join('');
}

function renderReports(reports) {
    if (!reportsList || !reportsCountSpan || !noReportsMessage) return;

    reportsCountSpan.textContent = `${reports.length} reports`;

    if (reports.length === 0) {
        reportsList.innerHTML = ''; // Clear any previous reports
        noReportsMessage.style.display = 'block'; // Show "No reports found" message
        return;
    }

    noReportsMessage.style.display = 'none'; // Hide "No reports found" message
    reportsList.innerHTML = reports.map(report => `
        <div class="report-card">
            <h3>${report.title || 'Untitled Report'}</h3>
            <p><strong>Date:</strong> ${formatDate(report.date) || 'N/A'}</p>
            <p><strong>Doctor:</strong> ${report.doctorName || 'N/A'}${report.doctorSpecialty ? ` (${report.doctorSpecialty})` : ''}</p>
            <p><strong>Summary:</strong> ${report.summary || 'No summary provided.'}</p>
            ${report.imageUrl ? `<img src="${report.imageUrl}" alt="Report Image" class="report-image" onclick="openReportImageModal('${report.imageUrl}')">` : ''}
        </div>
    `).join('');
}


function setupSearch(appointments, reports) {
    const searchInput = document.getElementById('searchInput');
    // Store original data references to filter from
    const originalAppointments = [...appointments]; // Create copies to avoid modifying original arrays
    const originalReports = [...reports];

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredAppointments = originalAppointments.filter(appointment =>
            (appointment.service && appointment.service.toLowerCase().includes(searchTerm)) || // Changed from 'type' to 'service'
            (appointment.doctor && appointment.doctor.toLowerCase().includes(searchTerm)) ||
            (appointment.status && appointment.status.toLowerCase().includes(searchTerm)) ||
            (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm)) ||
            (appointment.appointmentDate && formatAppointmentDateForDisplay(appointment.appointmentDate).toLowerCase().includes(searchTerm))
        );

        const filteredReports = originalReports.filter(report =>
            (report.title && report.title.toLowerCase().includes(searchTerm)) ||
            (report.type && report.type.toLowerCase().includes(searchTerm)) ||
            (report.doctorName && report.doctorName.toLowerCase().includes(searchTerm)) ||
            (report.summary && report.summary.toLowerCase().includes(searchTerm)) ||
            (report.date && formatDate(report.date).toLowerCase().includes(searchTerm))
        );

        renderAppointments(filteredAppointments);
        renderReports(filteredReports);
    });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
    // Ensure one tab is active by default on load
    if (tabButtons.length > 0) {
        // Find the initially active tab or click the first one
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            activeTab.click();
        } else {
            tabButtons[0].click(); // Activate the first tab by default
        }
    }
}

function updateStats(appointments, reports) {
    if (upcomingAppointmentsElement) {
        const now = new Date();
        const upcoming = appointments.filter(apt => {
            const aptDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
            return aptDateTime >= now && apt.status !== 'completed' && apt.status !== 'cancelled';
        }).length;
        upcomingAppointmentsElement.textContent = upcoming;
    }
    if (totalReportsElement) {
        totalReportsElement.textContent = reports.length;
    }

    if (lastVisitDateElement) {
        const completedAppointments = appointments.filter(apt => {
            const aptDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
            return aptDateTime < new Date() && apt.status === 'completed';
        }).sort((a, b) => new Date(`${b.appointmentDate}T${b.appointmentTime}`) - new Date(`${a.appointmentDate}T${a.appointmentTime}`)); // Sort desc
        if (completedAppointments.length > 0) {
            lastVisitDateElement.textContent = formatAppointmentDateForDisplay(completedAppointments[0].appointmentDate);
        } else {
            lastVisitDateElement.textContent = 'N/A';
        }
    }

    if (nextAppointmentDateElement) {
        const upcomingAppointments = appointments.filter(apt => {
            const aptDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
            return aptDateTime >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled';
        }).sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`)); // Sort asc

        if (upcomingAppointments.length > 0) {
            const nextAppt = upcomingAppointments[0];
            nextAppointmentDateElement.textContent = `${formatAppointmentDateForDisplay(nextAppt.appointmentDate)} at ${nextAppt.appointmentTime}`;
        } else {
            nextAppointmentDateElement.textContent = 'N/A';
        }
    }
}


// --- Initial App Load & Authentication Check ---
function checkAuth() {
    const loggedInEmail = localStorage.getItem('currentLoggedInPatientEmail');
    const authToken = localStorage.getItem('authToken');

    if (loggedInEmail && authToken) {
        fetch(`${BASE_URL}/api/patients/profile?email=${loggedInEmail}`, { // Fetch profile by email to get full patient data
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Re-auth: Backend sent non-OK response:', response.status, errorText);
                throw new Error(`Authentication failed or profile not found. Server said: "${errorText.substring(0, 100)}..."`);
            }
            const patientData = await response.json(); // Assuming this is always JSON now
            return patientData;
        })
        .then(patientData => {
            if (patientData && patientData.email === loggedInEmail) {
                currentUser = patientData;
                showDashboard();
            } else {
                console.error('Re-authentication failed or patient data mismatch.');
                logout(); // Clear invalid state
            }
        })
        .catch(error => {
            console.error('Error during re-authentication (network or API):', error);
            alert(`Error during re-authentication: ${error.message || 'Please log in again.'}`);
            logout(); // Clear state on network/API error
        });
    } else {
        showAuth(); // No stored credentials, show login/register
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Initial check for authentication status
});

// --- Report Image Modal Logic ---
// These are already in your original script and correctly defined as window functions
// No changes needed here, just ensuring they are available globally as expected.
window.openReportImageModal = function(imageUrl) {
    if (reportImageDisplay && reportImageModal) {
        reportImageDisplay.src = imageUrl;
        reportImageModal.classList.add('active');
    }
}

window.closeReportImageModal = function() {
    if (reportImageModal && reportImageDisplay) {
        reportImageModal.classList.remove('active');
        reportImageDisplay.src = ''; // Clear image source
    }
}

// Close report image modal on outside click
if (reportImageModal) {
    reportImageModal.addEventListener('click', (event) => {
        if (event.target === reportImageModal) {
            closeReportImageModal();
        }
    });
}


// --- Appointment Booking Modal Logic (Integrated with your existing structure) ---

// Function to show a specific step
function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index === stepIndex) {
            step.classList.add('active');
        }
    });
    updateProgressBar(stepIndex);
    updateNavigationButtons(stepIndex);
}

// Function to update the progress bar
function updateProgressBar(stepIndex) {
    progressSteps.forEach((step, index) => {
        if (index <= stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Function to update navigation buttons visibility
function updateNavigationButtons(stepIndex) {
    backBtn.style.display = stepIndex === 0 ? 'none' : 'inline-flex';
    nextBtn.style.display = stepIndex === formSteps.length - 1 ? 'none' : 'inline-flex';
    submitBtn.style.display = stepIndex === formSteps.length - 1 ? 'inline-flex' : 'none';
}

// Function to open the booking modal
// This is called from the HTML button's `onclick`
window.openBookingModal = function() {
    if (!currentUser) {
        alert("Please log in to book an appointment.");
        showAuth(); // Redirect to login if not logged in
        return;
    }

    if (bookingModal) bookingModal.classList.add('active');
    currentStep = 0; // Reset to first step
    showStep(currentStep); // Show the first step

    // Populate patient info in Step 1
    if (currentUser) {
        // Split name into first and last if combined
        const nameParts = currentUser.name ? currentUser.name.split(' ') : [];
        bookingFirstName.value = nameParts[0] || '';
        bookingLastName.value = nameParts.slice(1).join(' ') || '';
        bookingEmail.value = currentUser.email || '';
        bookingPhone.value = currentUser.phone || '';
        // Assuming 'address' field in your patient model. If not, this will be empty.
        bookingAddress.value = currentUser.address || '';
    }
}

// Function to close the booking modal
// This is called from the modal's close button `onclick`
window.closeBookingModal = function() {
    if (bookingModal) bookingModal.classList.remove('active');
    if (bookingForm) bookingForm.reset(); // Clear form fields on close
    currentStep = 0; // Reset step
    showStep(currentStep); // Ensure step 1 is active for next open
}

// Function to populate appointment summary in Step 3
function populateSummary() {
    // Get values from the form inputs
    const service = document.getElementById('service').value;
    const doctor = document.getElementById('doctor').value;
    const appointmentDate = document.getElementById('appointmentDateInput').value;
    const appointmentTime = document.getElementById('appointmentTimeInput').value;
    const notes = document.getElementById('notes').value;

    let summaryHtml = '';
    summaryHtml += `<p><strong>Patient Name:</strong> ${currentUser.name || 'N/A'}</p>`;
    summaryHtml += `<p><strong>Service:</strong> ${service || 'N/A'}</p>`;
    summaryHtml += `<p><strong>Preferred Doctor:</strong> ${doctor || 'Any Doctor'}</p>`;
    summaryHtml += `<p><strong>Date:</strong> ${appointmentDate ? formatAppointmentDateForDisplay(appointmentDate) : 'N/A'}</p>`;
    summaryHtml += `<p><strong>Time:</strong> ${appointmentTime || 'N/A'}</p>`;
    if (notes) {
        summaryHtml += `<p><strong>Notes:</strong> ${notes}</p>`;
    } else {
        summaryHtml += `<p><strong>Notes:</strong> None</p>`;
    }
    if (summaryContent) summaryContent.innerHTML = summaryHtml;
}


// Event listeners for multi-step navigation and form submission
function setupAppointmentBookingModal() {
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Basic validation before moving to next step
            const currentActiveStep = formSteps[currentStep];
            const inputs = currentActiveStep.querySelectorAll('input[required], select[required], textarea[required]');
            let allValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    allValid = false;
                    input.reportValidity(); // Show browser's validation message
                }
            });

            if (allValid) {
                if (currentStep < formSteps.length - 1) {
                    currentStep++;
                    if (currentStep === formSteps.length - 1) { // If moving to the last step (summary)
                        populateSummary();
                    }
                    showStep(currentStep);
                }
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    }

    // Form submission for booking appointment
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (!currentUser || !currentUser._id) {
                alert("Patient not logged in. Cannot book appointment.");
                logout();
                return;
            }

            const formData = new FormData(bookingForm);
            // Collect all relevant data from the form, including readonly fields
            const appointmentData = {
                patient: currentUser._id, // Send patient ID
                service: formData.get('service'),
                doctor: formData.get('doctor'),
                appointmentDate: formData.get('appointmentDate'),
                appointmentTime: formData.get('appointmentTime'),
                notes: formData.get('notes'),
                status: 'Scheduled' // Default status for new appointments
            };

            console.log('Attempting to book appointment with data:', appointmentData);

            // --- Send data to your backend API ---
            try {
                const token = localStorage.getItem('authToken');

                if (!token) {
                    alert('Authentication token missing. Please log in again.');
                    logout();
                    return;
                }

                const response = await fetch(`${BASE_URL}/api/appointments`, { // Endpoint to create new appointment
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(appointmentData)
                });

                if (!response.ok) {
                    const errorResponse = await response.json();
                    throw new Error(errorResponse.message || `Failed to book appointment: Server responded with status ${response.status}`);
                }

                const result = await response.json();
                alert('Appointment booked successfully!');
                console.log('Appointment booking response:', result);

                closeBookingModal(); // Close the modal
                // Refresh dashboard content to show new appointment
                await initializeDashboardContent(); // Re-fetch all dashboard data

            } catch (error) {
                console.error('Error booking appointment:', error);
                alert(`Error booking appointment: ${error.message || 'Please check console for details.'}`);
            }
        });
    }

    // Close modal on outside click (for booking modal)
    if (bookingModal) {
        bookingModal.addEventListener('click', (event) => {
            if (event.target === bookingModal) {
                closeBookingModal();
            }
        });
    }
}