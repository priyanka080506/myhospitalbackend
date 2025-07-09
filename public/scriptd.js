// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// Authentication state
let currentUser = null; // Stores doctor data upon successful login

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

const doctorNameElement = document.getElementById('doctorName');
const doctorSpecialtyElement = document.getElementById('doctorSpecialty');
const doctorEmailElement = document.getElementById('doctorEmail');
const doctorPhoneElement = document.getElementById('doctorPhone');
const doctorLicenseElement = document.getElementById('doctorLicense');
const doctorWorkingPlacesElement = document.getElementById('doctorWorkingPlaces');
const doctorProfilePhoto = document.getElementById('doctorProfilePhoto');

const dashboardWelcomeText = document.getElementById('dashboardWelcomeText');

const totalAppointmentsElement = document.getElementById('totalAppointments');
const upcomingAppointmentsElement = document.getElementById('upcomingAppointments'); // Corrected line
const patientsTodayElement = document.getElementById('patientsToday');
const totalPatientsElement = document.getElementById('totalPatients');

const scheduleList = document.getElementById('scheduleList');
const scheduleCount = document.getElementById('scheduleCount');
const patientsList = document.getElementById('patientsList'); // For patient reports
const reportsCount = document.getElementById('reportsCount'); // For patient reports count
const searchInput = document.getElementById('searchInput');

const workingPlacesContainer = document.getElementById('workingPlacesContainer');
const addMoreWorkingPlaceButton = document.getElementById('addMoreWorkingPlace');

// NEW: DOM element for Appointment Fees input
const registerAppointmentFeesInput = document.getElementById('registerAppointmentFees');


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
        case 'Consultation': return '<i class="fas fa-user-md"></i>';
        case 'Prescription': return '<i class="fas fa-prescription"></i>';
        case 'Symptoms Log': return '<i class="fas fa-notes-medical"></i>';
        case 'Home Monitoring': return '<i class="fas fa-home"></i>';
        case 'Questionnaire': return '<i class="fas fa-question-circle"></i>';
        default: return '<i class="fas fa-file-alt"></i>';
    }
}

// --- Dynamic Working Places Input (for Registration) ---
function addWorkingPlaceInput() {
    if (!workingPlacesContainer) return;

    const div = document.createElement('div');
    div.classList.add('working-place-row');
    div.innerHTML = `
        <input type="text" class="working-place-input" placeholder="Place (e.g., City Hospital)" required>
        <input type="text" class="working-timing-input" placeholder="Timing (e.g., Mon-Fri 9-5)" required>
        <button type="button" class="remove-input-button"><i class="fas fa-times-circle"></i></button>
    `;
    workingPlacesContainer.appendChild(div);

    // Add event listener to the new remove button
    div.querySelector('.remove-input-button').addEventListener('click', (e) => {
        e.target.closest('.working-place-row').remove();
        toggleRemoveButtons(); // Re-evaluate button visibility after removal
    });

    toggleRemoveButtons(); // Show remove buttons if more than one input
}

function toggleRemoveButtons() {
    if (!workingPlacesContainer) return;
    const removeButtons = workingPlacesContainer.querySelectorAll('.remove-input-button');
    if (removeButtons.length > 1) {
        removeButtons.forEach(btn => btn.style.display = 'inline-block');
    } else {
        removeButtons.forEach(btn => btn.style.display = 'none');
    }
}

// --- Authentication event listeners ---
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.add('active');
        // Add initial working place input when showing register form
        if (workingPlacesContainer && workingPlacesContainer.children.length === 0) {
            addWorkingPlaceInput();
        }
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

        let email = emailInput ? emailInput.value : '';
        let password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/doctors/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.doctor; // Store doctor data
                localStorage.setItem('authToken', data.token); // Store token
                localStorage.setItem('currentLoggedInDoctorEmail', email); // Store email for re-auth
                console.log('Doctor login successful:', currentUser);
                showDashboard();
                if (loginFormElement) loginFormElement.reset();
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
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
        const specialtyInput = document.getElementById('registerSpecialty');
        const licenseInput = document.getElementById('registerLicense');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        // NEW: Get appointment fees input value
        const appointmentFeesInput = document.getElementById('registerAppointmentFees');


        let name = nameInput ? nameInput.value : '';
        let email = emailInput ? emailInput.value : '';
        let phone = phoneInput ? phoneInput.value : '';
        let specialty = specialtyInput ? specialtyInput.value : '';
        let license = licenseInput ? licenseInput.value : '';
        let password = passwordInput ? passwordInput.value : '';
        let confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        // NEW: Get appointment fees value, convert to number
        let appointmentFees = appointmentFeesInput ? parseFloat(appointmentFeesInput.value) : 0;


        // Collect working places and timings
        const workingPlaces = [];
        if (workingPlacesContainer) {
            workingPlacesContainer.querySelectorAll('.working-place-row').forEach(row => {
                const placeInput = row.querySelector('.working-place-input');
                const timingInput = row.querySelector('.working-timing-input');
                if (placeInput && timingInput && placeInput.value.trim() && timingInput.value.trim()) {
                    workingPlaces.push({ place: placeInput.value.trim(), timing: timingInput.value.trim() });
                }
            });
        }

        // Validate form
        if (!name || !email || !phone || !specialty || !license || !password || !confirmPassword || workingPlaces.length === 0) {
            alert('Please fill in all required fields, including at least one working place.');
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

        // NEW: Validate appointment fees
        if (isNaN(appointmentFees) || appointmentFees < 0) {
            alert('Please enter a valid positive number for Appointment Fees.');
            return;
        }


        try {
            const response = await fetch(`${BASE_URL}/api/doctors/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    phone, 
                    specialty, 
                    license, 
                    password, 
                    workingPlaces, 
                    photo: 'https://i.pravatar.cc/80?img=1',
                    appointmentFees // NEW: Include appointmentFees in the payload
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please log in.');
                if (loginForm) loginForm.classList.add('active');
                if (registerForm) registerForm.classList.remove('active');
                if (registerFormElement) registerFormElement.reset();
                if (workingPlacesContainer) workingPlacesContainer.innerHTML = ''; // Clear working places inputs
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    });
}

// --- Logout Logic ---
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('authToken'); // Clear auth token
        localStorage.removeItem('currentLoggedInDoctorEmail'); // Clear mock login state
        if (authSection) authSection.style.display = 'flex';
        if (mainDashboard) mainDashboard.style.display = 'none';
        if (loginFormElement) loginFormElement.reset();
        if (registerFormElement) registerFormElement.reset();
        if (searchInput) searchInput.value = '';
    });
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
        if (doctorNameElement) doctorNameElement.textContent = currentUser.name || 'Doctor';
        if (doctorSpecialtyElement) doctorSpecialtyElement.textContent = currentUser.specialty || 'General Practitioner';
        if (doctorEmailElement) doctorEmailElement.textContent = currentUser.email || 'N/A';
        if (doctorPhoneElement) doctorPhoneElement.textContent = currentUser.phone || 'N/A';
        if (doctorLicenseElement) doctorLicenseElement.textContent = currentUser.license || 'N/A';
        if (doctorProfilePhoto) doctorProfilePhoto.src = currentUser.photo || 'https://i.pravatar.cc/80?img=1';
        if (dashboardWelcomeText) dashboardWelcomeText.textContent = `Welcome, Dr. ${currentUser.name || 'Doctor'}!`;

        if (doctorWorkingPlacesElement) {
            if (currentUser.workingPlaces && currentUser.workingPlaces.length > 0) {
                doctorWorkingPlacesElement.innerHTML = currentUser.workingPlaces.map(wp =>
                    `<span>${wp.place} (${wp.timing})</span>`
                ).join('<br>');
            } else {
                doctorWorkingPlacesElement.textContent = 'N/A';
            }
        }
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

    let schedule = [];
    let patientReports = [];

    try {
        // Fetch Doctor's Schedule
        const scheduleResponse = await fetch(`${BASE_URL}/api/doctors/schedule/${currentUser._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const scheduleData = await scheduleResponse.json();
        if (scheduleResponse.ok && Array.isArray(scheduleData)) {
            schedule = scheduleData;
            renderSchedule(schedule);
        } else {
            console.error('Failed to fetch schedule or received non-array data:', scheduleData);
            renderSchedule([]);
        }

        // Fetch Patient Reports relevant to this doctor
        const reportsResponse = await fetch(`${BASE_URL}/api/doctors/patient-reports/${currentUser._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportsData = await reportsResponse.json();
        if (reportsResponse.ok && Array.isArray(reportsData)) {
            patientReports = reportsData;
            renderPatientReports(patientReports);
        } else {
            console.error('Failed to fetch patient reports or received non-array data:', reportsData);
            renderPatientReports([]);
        }

        // Setup search and tabs after data is loaded
        setupSearch(schedule, patientReports);
        setupTabs(); // This correctly sets up the tab listeners
        updateStats(schedule, patientReports);

    } catch (error) {
        console.error('Error initializing dashboard content:', error);
        alert('Failed to load dashboard data. Please try refreshing or logging in again.');
    }
}

function renderSchedule(schedule) {
    if (!scheduleList || !scheduleCount) return;

    scheduleCount.textContent = `${schedule.length} appointments`;

    if (schedule.length === 0) {
        scheduleList.innerHTML = '<p class="no-data-message">No upcoming appointments found.</p>';
        return;
    }

    scheduleList.innerHTML = schedule.map(appointment => `
        <div class="card">
            <div class="schedule-header">
                <div>
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span class="time">${appointment.time}</span>
                    </div>
                    <div class="appointment-duration">
                        <span>${appointment.duration}</span>
                    </div>
                </div>
                <div class="appointment-badges">
                    <span class="status-badge ${appointment.status?.toLowerCase() || ''}">${appointment.status || 'N/A'}</span>
                    <span class="type-badge ${appointment.type?.toLowerCase().replace('-', '') || ''}">${appointment.type || 'N/A'}</span>
                </div>
            </div>

            <div class="patient-info">
                <div class="patient-detail">
                    <i class="fas fa-user"></i>
                    <div>
                        <span class="label">Patient:</span>
                        <div class="value">${appointment.patient || 'N/A'}</div>
                    </div>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-id-card"></i>
                    <div>
                        <span class="label">Patient ID:</span>
                        <div class="value">${appointment.patientId || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="appointment-notes">
                <div class="notes-header">
                    <i class="fas fa-file-text"></i>
                    <span class="notes-title">Condition:</span>
                </div>
                <div class="notes-content">${appointment.condition || 'No specific condition mentioned.'}</div>
            </div>

            <div class="action-buttons">
                <button class="action-button primary">
                    <i class="fas fa-check"></i>
                    Complete
                </button>
                <button class="action-button">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        </div>
    `).join('');
}

function renderPatientReports(reports) {
    if (!patientsList || !reportsCount) return;

    reportsCount.textContent = `${reports.length} reports`;

    if (reports.length === 0) {
        patientsList.innerHTML = '<p class="no-data-message">No patient reports found.</p>';
        return;
    }

    patientsList.innerHTML = reports.map(report => `
        <div class="card">
            <div class="report-header">
                <div class="report-title-section">
                    <div class="report-icon">${getReportIcon(report.type)}</div>
                    <div>
                        <div class="report-title">${report.title}</div>
                        <div class="report-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(report.date || report.lastVisit)}</span>
                        </div>
                    </div>
                </div>
                <span class="report-type-badge ${report.type?.toLowerCase().replace(/\s/g, '') || ''}">${report.type || 'N/A'}</span>
            </div>

            <div class="report-patient-info">
                <i class="fas fa-user"></i>
                <span>Patient: ${report.patient || 'N/A'} (ID: ${report.patientId?.substring(0, 8)}...)</span>
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


function setupSearch(schedule, patientReports) {
    const searchInput = document.getElementById('searchInput');
    // Store original data references to filter from
    const originalSchedule = [...schedule];
    const originalPatientReports = [...patientReports];

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activeTab = document.querySelector('.tab-panel.active');

        if (activeTab.id === 'schedule-tab') {
            const filteredSchedule = originalSchedule.filter(appointment =>
                (appointment.patient && appointment.patient.toLowerCase().includes(searchTerm)) ||
                (appointment.patientId && appointment.patientId.toLowerCase().includes(searchTerm)) ||
                (appointment.condition && appointment.condition.toLowerCase().includes(searchTerm)) ||
                (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm))
            );
            renderSchedule(filteredSchedule);
        } else if (activeTab.id === 'reports-tab') {
            const filteredReports = originalPatientReports.filter(report =>
                (report.patient && report.patient.toLowerCase().includes(searchTerm)) ||
                (report.patientId && report.patientId.toLowerCase().includes(searchTerm)) ||
                (report.title && report.title.toLowerCase().includes(searchTerm)) ||
                (report.summary && report.summary.toLowerCase().includes(searchTerm)) ||
                (report.nextAction && report.nextAction.toLowerCase().includes(searchTerm))
            );
            renderPatientReports(filteredReports);
        }
    });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        // Remove existing listeners to prevent duplicates if called multiple times
        button.removeEventListener('click', handleTabClick);
        // Add the new listener
        button.addEventListener('click', handleTabClick);
    });

    // Activate the first tab by default on load, if no active tab is set
    const activeTab = document.querySelector('.tab-button.active');
    if (!activeTab && tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

function handleTabClick() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const targetTab = this.getAttribute('data-tab'); // 'this' refers to the clicked button

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    this.classList.add('active'); // Add active to the clicked button
    const targetPanel = document.getElementById(targetTab);
    if (targetPanel) targetPanel.classList.add('active');

    // Re-run search if a search term is present to filter the newly active tab's content
    if (searchInput && searchInput.value.trim() !== '') {
        // We need to re-initialize search with the original data before filtering
        // This is handled by initializeDashboardContent calling setupSearch with original data
        // So, just triggering the search input event should be enough.
        searchInput.dispatchEvent(new Event('input'));
    }
}


function updateStats(schedule, patientReports) {
    if (totalAppointmentsElement) {
        totalAppointmentsElement.textContent = schedule.length;
    }
    if (upcomingAppointmentsElement) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = schedule.filter(apt => apt.date && apt.date >= today && apt.status !== 'completed').length;
        upcomingAppointmentsElement.textContent = upcoming;
    }
    if (patientsTodayElement) {
        const today = new Date().toISOString().split('T')[0];
        const patientsForToday = schedule.filter(apt => apt.date === today).length;
        patientsTodayElement.textContent = patientsForToday;
    }
    if (totalPatientsElement) {
        // This would ideally come from a count of unique patients in your DB
        // For mock data, we can count unique patient IDs from reports or schedule
        const uniquePatientIds = new Set();
        schedule.forEach(apt => uniquePatientIds.add(apt.patientId));
        patientReports.forEach(report => uniquePatientIds.add(report.patientId));
        totalPatientsElement.textContent = uniquePatientIds.size;
    }
}

// --- Initial App Load & Authentication Check ---
function checkAuth() {
    const loggedInEmail = localStorage.getItem('currentLoggedInDoctorEmail');
    const authToken = localStorage.getItem('authToken');

    if (loggedInEmail && authToken) {
        // Attempt to re-authenticate using the stored email and token
        fetch(`${BASE_URL}/api/doctors/profile?email=${loggedInEmail}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Authentication failed or profile not found');
            }
            return response.json();
        })
        .then(doctorData => {
            if (doctorData && doctorData.email === loggedInEmail) {
                currentUser = doctorData;
                showDashboard();
            } else {
                console.error('Re-authentication failed or doctor data mismatch.');
                logout(); // Clear invalid state
            }
        })
        .catch(error => {
            console.error('Error during re-authentication:', error);
            logout(); // Clear state on network/API error
        });
    } else {
        showAuth(); // No stored credentials, show login/register
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Initial check for authentication status

    // Attach event listener for adding more working places
    if (addMoreWorkingPlaceButton) {
        addMoreWorkingPlaceButton.addEventListener('click', addWorkingPlaceInput);
        toggleRemoveButtons(); // Initialize remove button visibility
    }

    // Attach logout listener
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
        });
    }
});
