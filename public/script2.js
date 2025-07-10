// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// Authentication state
let currentUser = null; // Stores user data upon successful login

// DOM elements (Ensuring they exist before accessing)
const authSection = document.getElementById('authSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const logoutButton = document.getElementById('logoutButton');
const patientNameElement = document.getElementById('patientName'); // For displaying patient name on dashboard
const dashboardWelcomeText = document.getElementById('dashboardWelcomeText'); // Assuming you have this for a welcome message

const appointmentsList = document.getElementById('appointmentsList');
const appointmentCount = document.getElementById('appointmentCount');
const reportsList = document.getElementById('reportsList');
const reportsCount = document.getElementById('reportsCount');
const totalAppointmentsElement = document.getElementById('totalAppointments');
const upcomingAppointmentsElement = document.getElementById('upcomingAppointments');
const completedAppointmentsElement = document.getElementById('completedAppointments');
const totalReportsElement = document.getElementById('totalReports');
const searchInput = document.getElementById('searchInput');

// New DOM element for gender display
const patientGenderDisplay = document.getElementById('patientGenderDisplay');
// New DOM elements for other patient details (from index2.html)
const patientIdDisplay = document.getElementById('patientIdDisplay');
const patientDobDisplay = document.getElementById('patientDobDisplay');
const patientPhoneDisplay = document = document.getElementById('patientPhoneDisplay');
const patientEmailDisplay = document.getElementById('patientEmailDisplay');
const patientAddressDisplay = document.getElementById('patientAddressDisplay');


// --- Helper Functions ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    try {
        const date = new Date(dateString + 'T00:00:00Z'); // Treat as UTC to avoid timezone issues
        return date.toLocaleDateString('en-US', options);
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
        default: return '<i class="fas fa-file-alt"></i>';
    }
}

// --- Authentication event listeners ---
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.add('active');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        if (registerForm) registerForm.classList.remove('active');
        if (loginForm) loginForm.classList.add('active');
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
        const emailInput = document.getElementById('registerEmail'); // Corrected from 'C'
        const phoneInput = document.getElementById('registerPhone');
        const dobInput = document.getElementById('registerDob');
        const genderInput = document.getElementById('registerGender'); // Get gender input
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        let name = nameInput ? nameInput.value : '';
        let email = emailInput ? emailInput.value : '';
        let phone = phoneInput ? phoneInput.value : '';
        let dob = dobInput ? dobInput.value : '';
        let gender = genderInput ? genderInput.value : ''; // Get gender value

        console.log('passwordInput:', passwordInput);

        let password = '';
        if (passwordInput) {
            password = passwordInput.value;
        }

        let confirmPassword = '';
        if (confirmPasswordInput) {
            confirmPassword = confirmPasswordInput.value;
        }

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
                if (loginForm) loginForm.classList.add('active');
                if (registerForm) registerForm.classList.remove('active');
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
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
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
    if (loginForm) loginForm.classList.add('active');
    if (registerForm) registerForm.classList.remove('active');
}

async function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'block';

    if (currentUser) {
        if (patientNameElement) patientNameElement.textContent = currentUser.name || 'Patient';
        if (dashboardWelcomeText) dashboardWelcomeText.textContent = `Welcome, ${currentUser.name || 'Patient'}!`;

        // Update other patient details
        if (patientIdDisplay) patientIdDisplay.textContent = currentUser._id || 'N/A'; // Use _id for MongoDB ID
        if (patientDobDisplay) patientDobDisplay.textContent = `DOB: ${formatDate(currentUser.dateOfBirth || currentUser.dob) || 'N/A'}`;
        if (patientPhoneDisplay) patientPhoneDisplay.textContent = currentUser.phone || 'N/A';
        if (patientEmailDisplay) patientEmailDisplay.textContent = currentUser.email || 'N/A';
        if (patientAddressDisplay) patientAddressDisplay.textContent = currentUser.address || 'N/A';
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
        const appointmentsResponse = await fetch(`${BASE_URL}/api/appointments/${currentUser._id}`, {
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

    } catch (error) {
        console.error('Error initializing dashboard content (overall fetch process):', error);
        alert('Failed to load dashboard data. Please try refreshing or logging in again. Check browser console for specific server message.');
    }
}


function renderAppointments(appointments) {
    if (!appointmentsList || !appointmentCount) return;

    appointmentCount.textContent = `${appointments.length} appointments`;

    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p class="no-data-message">No appointments found.</p>';
        return;
    }

    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="card">
            <div class="appointment-header">
                <div>
                    <div class="appointment-date">
                        <i class="fas fa-calendar"></i>
                        <span class="date">${formatDate(appointment.date)}</span>
                    </div>
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span>${appointment.time}</span>
                    </div>
                </div>
                <div class="appointment-badges">
                    <span class="status-badge ${appointment.status?.toLowerCase() || ''}">${appointment.status || 'N/A'}</span>
                    <span class="type-badge ${appointment.type?.toLowerCase().replace('-', '') || ''}">${appointment.type || 'N/A'}</span>
                </div>
            </div>

            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-user-md"></i>
                    <div>
                        <span class="label">${appointment.doctor || 'N/A'}</span>
                        <div class="value">${appointment.department || 'N/A'}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-stethoscope"></i>
                    <div>
                        <span class="label">Diagnosis</span>
                        <div class="value">${appointment.diagnosis || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="appointment-notes">
                <div class="notes-header">
                    <i class="fas fa-file-text"></i>
                    <span class="notes-title">Notes:</span>
                </div>
                <div class="notes-content">${appointment.notes || 'No notes available.'}</div>
            </div>

            <button class="view-button">
                <i class="fas fa-eye"></i>
                View Details
            </button>
        </div>
    `).join('');
}

function renderReports(reports) {
    if (!reportsList || !reportsCount) return;

    reportsCount.textContent = `${reports.length} reports`;

    if (reports.length === 0) {
        reportsList.innerHTML = '<p class="no-data-message">No patient reports found.</p>';
        return;
    }

    reportsList.innerHTML = reports.map(report => `
        <div class="card">
            <div class="report-header">
                <div class="report-title-section">
                    <div class="report-icon">${getReportIcon(report.type)}</div>
                    <div>
                        <div class="report-title">${report.title}</div>
                        <div class="report-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(report.date)}</span>
                        </div>
                    </div>
                </div>
                <span class="report-type-badge ${report.type?.toLowerCase() || ''}">${report.type || 'N/A'}</span>
            </div>

            <div class="report-doctor">
                <i class="fas fa-user-md"></i>
                <span>By ${report.doctor || 'N/A'}</span>
            </div>

            <div class="report-summary">
                <p><strong>Summary:</strong> ${report.summary || 'No summary available.'}</p>
                <p><strong>Next Action:</strong> ${report.nextAction || 'N/A'}</p>
            </div>

            <div class="report-footer">
                <span class="final-badge">✓ ${report.status || 'N/A'}</span>
                <div class="report-actions">
                    <button class="action-button view">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="action-button download">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
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
            (appointment.doctor && appointment.doctor.toLowerCase().includes(searchTerm)) ||
            (appointment.department && appointment.department.toLowerCase().includes(searchTerm)) ||
            (appointment.diagnosis && appointment.diagnosis.toLowerCase().includes(searchTerm)) ||
            (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm))
        );

        const filteredReports = originalReports.filter(report =>
            (report.title && report.title.toLowerCase().includes(searchTerm)) ||
            (report.type && report.type.toLowerCase().includes(searchTerm)) ||
            (report.doctor && report.doctor.toLowerCase().includes(searchTerm)) ||
            (report.summary && report.summary.toLowerCase().includes(searchTerm))
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

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
    // Ensure one tab is active by default on load
    if (tabButtons.length > 0) {
        tabButtons[0].click(); // Activate the first tab by default
    }
}

function updateStats(appointments, reports) {
    if (totalAppointmentsElement) {
        totalAppointmentsElement.textContent = appointments.length;
    }
    if (totalReportsElement) {
        totalReportsElement.textContent = reports.length;
    }
    if (upcomingAppointmentsElement) {
        // Filter for upcoming appointments (date in future and not completed)
        const upcoming = appointments.filter(apt => new Date(apt.date) >= new Date() && apt.status !== 'completed').length;
        upcomingAppointmentsElement.textContent = upcoming;
    }
    if (completedAppointmentsElement) {
        const completed = appointments.filter(apt => apt.status === 'completed').length;
        completedAppointmentsElement.textContent = completed;
    }
}


// --- Initial App Load & Authentication Check ---
function checkAuth() {
    const loggedInEmail = localStorage.getItem('currentLoggedInPatientEmail');
    const authToken = localStorage.getItem('authToken');

    if (loggedInEmail && authToken) {
        // Attempt to re-authenticate using the stored email and token
        fetch(`${BASE_URL}/api/patients/profile?email=${loggedInEmail}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text(); // Read the text of the error response
                console.error('Re-auth: Backend sent non-OK response:', response.status, errorText);
                throw new Error(`Authentication failed or profile not found. Server said: "${errorText.substring(0, 100)}..."`);
            }
            // Clone the response BEFORE attempting to read its body
            const responseClone = response.clone();
            let patientData;
            try {
                patientData = await response.json();
            } catch (jsonError) {
                console.error('Re-auth: Error parsing profile JSON response (likely server-side error):', jsonError);
                const rawText = await responseClone.text(); // Use the clone here
                console.error('Re-auth: Raw non-JSON profile response from server:', rawText);
                throw new Error(`Re-authentication data not JSON: "${rawText.substring(0, 100)}..."`);
            }
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