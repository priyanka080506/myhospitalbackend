// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// Authentication state
let currentDoctor = null; // Stores doctor data upon successful login

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
const dashboardWelcomeText = document.getElementById('dashboardWelcomeText'); // This element will now show dynamic name

// Doctor Photo DOM elements
const doctorPhotoElement = document.getElementById('doctorPhoto');
const photoUploadInput = document.getElementById('photoUploadInput');

// DOM elements for Working Places
const workingPlacesContainer = document.getElementById('workingPlacesContainer');
const addWorkingPlaceBtn = document.getElementById('addWorkingPlace');

// Dashboard specific elements
const scheduleList = document.getElementById('scheduleList');
const scheduleCount = document.getElementById('scheduleCount');
const patientsList = document.getElementById('patientsList'); // Renamed from reportsList for clarity in doctor context
const patientsCount = document.getElementById('patientsCount'); // Renamed from reportsCount for clarity
const searchInput = document.getElementById('searchInput');

// Stat cards
const todayAppointmentsElement = document.getElementById('todayAppointments');
const totalPatientsElement = document.getElementById('totalPatients');
const pendingReportsElement = document.getElementById('pendingReports');
const upcomingAppointmentsElement = document.getElementById('upcomingAppointments');

// New DOM elements for doctor profile details
const doctorLicenseDisplay = document.getElementById('doctorLicenseDisplay');
const doctorPhoneDisplay = document.getElementById('doctorPhoneDisplay');
const doctorWorkingPlacesDisplay = document.getElementById('doctorWorkingPlacesDisplay'); // Corrected ID

// Removed Add Report Modal Elements as it's now a separate page
// const addReportModal = document.getElementById('addReportModal');
// const addNewReportBtn = document.getElementById('addNewReportBtn'); // This button will now be an <a> tag
// const addReportForm = document.getElementById('addReportForm');
// const reportPatientIdSelect = document.getElementById('reportPatientId');
// const reportDateInput = document.getElementById('reportDate');


// --- Helper Functions ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
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
        case 'Prescription': return '<i class="fas fa-prescription-bottle-alt"></i>';
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

// Logic for adding new working place & timing input fields dynamically
if (addWorkingPlaceBtn) {
    addWorkingPlaceBtn.addEventListener('click', () => {
        const newRow = document.createElement('div');
        newRow.className = 'working-place-row';

        const newPlaceInput = document.createElement('input');
        newPlaceInput.type = 'text';
        newPlaceInput.className = 'working-place-input';
        newPlaceInput.placeholder = 'e.g., City General Hospital';
        newPlaceInput.required = true;

        const newTimingInput = document.createElement('input');
        newTimingInput.type = 'text';
        newTimingInput.className = 'working-timing-input';
        newTimingInput.placeholder = 'e.g., Mon 9AM-5PM';
        newTimingInput.required = true;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-input-button';
        removeButton.innerHTML = '<i class="fas fa-times-circle"></i>';
        removeButton.title = 'Remove this working place & timing';
        removeButton.style.display = 'inline-block';

        removeButton.addEventListener('click', () => {
            if (workingPlacesContainer) {
                workingPlacesContainer.removeChild(newRow);
            }
        });

        newRow.appendChild(newPlaceInput);
        newRow.appendChild(newTimingInput);
        newRow.appendChild(removeButton);
        if (workingPlacesContainer) {
            workingPlacesContainer.appendChild(newRow);
        }
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
            const response = await fetch(`${BASE_URL}/api/doctors/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                currentDoctor = data.doctor; // Store doctor data
                localStorage.setItem('authToken', data.token); // Store token
                localStorage.setItem('currentLoggedInDoctorEmail', email); // Store email for re-auth
                console.log('Doctor login successful:', currentDoctor);
                showDashboard();
                if (loginFormElement) loginFormElement.reset(); // This line clears the form on SUCCESS
            } else {
                // This alert shows the error message
                alert(data.message || 'Login failed. Please check your credentials.');
                // Removed loginFormElement.reset() from here
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again later.');
            // Removed loginFormElement.reset() from here
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

        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const phone = phoneInput ? phoneInput.value : '';
        const specialty = specialtyInput ? specialtyInput.value : '';
        const license = licenseInput ? licenseInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        // Get all working places and timings
        const workingPlaceRows = document.querySelectorAll('.working-place-row');
        const workingPlacesAndTimings = [];

        workingPlaceRows.forEach(row => {
            const placeInput = row.querySelector('.working-place-input');
            const timingInput = row.querySelector('.working-timing-input');

            if (placeInput && timingInput) {
                const place = placeInput.value.trim();
                const timing = timingInput.value.trim();
                if (place && timing) { // Only add if both place and timing are filled
                    workingPlacesAndTimings.push({ place: place, timing: timing });
                }
            }
        });

        // Validate form
        if (!name || !email || !phone || !specialty || !license || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (workingPlacesAndTimings.length === 0) {
            alert('Please add at least one Working Place and its Timings.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
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
                    workingPlaces: workingPlacesAndTimings,
                    photo: 'https://i.pravatar.cc/80?img=1' // Default photo, can be updated later
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please log in.');
                if (loginForm) loginForm.classList.add('active');
                if (registerForm) registerForm.classList.remove('active');
                if (registerFormElement) registerFormElement.reset();
                // Clear dynamically added working place & timing inputs
                const initialRow = workingPlacesContainer ? workingPlacesContainer.querySelector('.working-place-row') : null;
                if (workingPlacesContainer) {
                    while (workingPlacesContainer.children.length > 1) { // Keep only the first, initial row
                        workingPlacesContainer.removeChild(workingPlacesContainer.lastChild);
                    }
                }
                if (initialRow) {
                    const placeInput = initialRow.querySelector('.working-place-input');
                    const timingInput = initialRow.querySelector('.working-timing-input');
                    if (placeInput) placeInput.value = '';
                    if (timingInput) timingInput.value = '';
                }
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
        currentDoctor = null;
        localStorage.removeItem('authToken'); // Clear auth token
        localStorage.removeItem('currentLoggedInDoctorEmail'); // Clear mock login state
        showAuth();
        if (loginFormElement) loginFormElement.reset();
        if (registerFormElement) registerFormElement.reset();
        if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';

        // Clear dynamically added working place & timing inputs on logout
        const initialRow = workingPlacesContainer ? workingPlacesContainer.querySelector('.working-place-row') : null;
        if (workingPlacesContainer) {
            while (workingPlacesContainer.children.length > 1) {
                workingPlacesContainer.removeChild(workingPlacesContainer.lastChild);
            }
        }
        if (initialRow) {
            const placeInput = initialRow.querySelector('.working-place-input');
            const timingInput = initialRow.querySelector('.working-timing-input');
            if (placeInput) placeInput.value = '';
            if (timingInput) timingInput.value = '';
        }

        // Reset doctor photo to default on logout
        if (doctorPhotoElement) doctorPhotoElement.src = 'https://i.pravatar.cc/80?img=1';
    });
}

// --- UI Display Functions ---
function showAuth() {
    if (authSection) authSection.style.display = 'flex';
    if (mainDashboard) mainDashboard.style.display = 'none';
    // Ensure login form is active by default
    if (loginForm) loginForm.classList.add('active');
    if (registerForm) registerForm.classList.remove('active');
}

async function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'block';

    // Update doctor info if user is logged in
    if (currentDoctor) {
        if (doctorNameElement) doctorNameElement.textContent = currentDoctor.name;
        if (doctorSpecialtyElement) doctorSpecialtyElement.textContent = currentDoctor.specialty + ' Specialist';
        if (doctorEmailElement) doctorEmailElement.textContent = currentDoctor.email;
        if (dashboardWelcomeText) dashboardWelcomeText.textContent = `Welcome, Dr. ${currentDoctor.name}!`;
        if (doctorPhotoElement) doctorPhotoElement.src = currentDoctor.photo || 'https://i.pravatar.cc/80?img=1';

        // Update new profile fields
        if (doctorLicenseDisplay) doctorLicenseDisplay.textContent = `License: ${currentDoctor.license || 'N/A'}`;
        if (doctorPhoneDisplay) doctorPhoneDisplay.textContent = currentDoctor.phone || 'N/A';
        // Display working places (first one or list all)
        if (doctorWorkingPlacesDisplay) { // Corrected ID usage
            if (currentDoctor.workingPlaces && currentDoctor.workingPlaces.length > 0) {
                // Display all working places, separated by commas or line breaks
                const placesHtml = currentDoctor.workingPlaces.map(wp => `${wp.place} (${wp.timing})`).join('<br>');
                doctorWorkingPlacesDisplay.innerHTML = `<i class="fas fa-hospital"></i><span>${placesHtml}</span>`;
            } else {
                doctorWorkingPlacesDisplay.innerHTML = `<i class="fas fa-hospital"></i><span>N/A</span>`;
            }
        }
    }

    // Initialize dashboard content with data from backend
    await initializeDashboardContent();
}

// --- Photo Upload Logic (Client-Side Only for Mock) ---
if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            if (doctorPhotoElement) doctorPhotoElement.src = e.target.result;
            // In a real application, you would upload this file to your backend
            // and then update the doctor's profile on the server.
            // For now, we'll just update the client-side currentDoctor object
            if (currentDoctor) {
                currentDoctor.photo = e.target.result;
            }
        };

        reader.readAsDataURL(file);
        alert('Profile photo updated (client-side only)! In a real app, this would be uploaded to the server.');
    });
}

// --- Dashboard Data Fetching and Rendering (from Backend) ---
async function initializeDashboardContent() {
    if (!currentDoctor || !currentDoctor._id) {
        console.error("No current doctor or doctor ID available for dashboard data.");
        showAuth();
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn("No auth token found for dashboard data. Please log in.");
        showAuth();
        return;
    }

    try {
        // Fetch Today's Schedule (Appointments for this doctor)
        const scheduleResponse = await fetch(`${BASE_URL}/api/doctors/schedule/${currentDoctor._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const todaysSchedule = await scheduleResponse.json();
        if (scheduleResponse.ok) {
            renderSchedule(todaysSchedule);
        } else {
            console.error('Failed to fetch schedule:', todaysSchedule.message);
            renderSchedule([]); // Render empty if fetch fails
        }

        // Fetch Patient Reports (Reports associated with this doctor's patients)
        const patientReportsResponse = await fetch(`${BASE_URL}/api/doctors/patient-reports/${currentDoctor._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const patientReports = await patientReportsResponse.json();
        if (patientReportsResponse.ok) {
            renderPatientReports(patientReports);
        } else {
            console.error('Failed to fetch patient reports:', patientReports.message);
            renderPatientReports([]); // Render empty if fetch fails
        }

        // Removed populatePatientDropdown call from here as it's now in add-report-script.js


        // Setup search and tabs after data is potentially loaded
        setupSearch(todaysSchedule, patientReports);
        setupTabs();
        updateStats(todaysSchedule, patientReports);

    } catch (error) {
        console.error('Error initializing dashboard content:', error);
        alert('Failed to load dashboard data. Please try refreshing or logging in again.');
        // Consider logging out on severe error
        // logout();
    }
}

function renderSchedule(schedule) {
    if (!scheduleList || !scheduleCount) return;

    scheduleCount.textContent = `${schedule.length} appointments`;

    if (schedule.length === 0) {
        scheduleList.innerHTML = '<p class="no-data-message">No appointments scheduled for today.</p>';
        return;
    }

    scheduleList.innerHTML = schedule.map(appointment => `
        <div class="card">
            <div class="schedule-header">
                <div>
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span class="time">${appointment.time || 'N/A'}</span>
                    </div>
                    <div class="appointment-duration">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${appointment.duration || 'N/A'}</span>
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
                        <span class="label">${appointment.patient || 'N/A'}</span>
                        <div class="value">${appointment.patientId || 'N/A'}</div>
                    </div>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-stethoscope"></i>
                    <div>
                        <span class="label">Condition</span>
                        <div class="value">${appointment.condition || 'N/A'}</div>
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

            <div class="action-buttons">
                <button class="action-button primary">
                    <i class="fas fa-play"></i>
                    Start Appointment
                </button>
                <button class="action-button">
                    <i class="fas fa-phone"></i>
                    Call Patient
                </button>
            </div>
        </div>
    `).join('');
}

function renderPatientReports(reports) {
    if (!patientsList || !patientsCount) return;

    patientsCount.textContent = `${reports.length} reports`;

    if (reports.length === 0) {
        patientsList.innerHTML = '<p class="no-data-message">No patient reports found. Click "Add New Report" to add one.</p>';
        return;
    }

    patientsList.innerHTML = reports.map(report => `
        <div class="card">
            <div class="report-header">
                <div class="report-title-section">
                    <div class="report-icon">${getReportIcon(report.type)}</div>
                    <div>
                        <div class="report-title">${report.title || 'N/A'}</div>
                        <div class="report-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(report.lastVisit || report.date)}</span>
                        </div>
                    </div>
                </div>
                <span class="report-type-badge ${report.type?.toLowerCase() || ''}">${report.type || 'N/A'}</span>
            </div>

            <div class="report-patient-info">
                <i class="fas fa-user"></i>
                <span>Patient: ${report.patient || 'N/A'} (${report.patientId || 'N/A'})</span>
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

function setupSearch(schedule, reports) {
    const searchInput = document.getElementById('searchInput');
    const originalSchedule = [...schedule];
    const originalReports = [...reports];

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredSchedule = originalSchedule.filter(appointment =>
            (appointment.patient && appointment.patient.toLowerCase().includes(searchTerm)) ||
            (appointment.condition && appointment.condition.toLowerCase().includes(searchTerm)) ||
            (appointment.type && appointment.type.toLowerCase().includes(searchTerm)) ||
            (appointment.patientId && appointment.patientId.toLowerCase().includes(searchTerm))
        );

        const filteredReports = originalReports.filter(report =>
            (report.patient && report.patient.toLowerCase().includes(searchTerm)) ||
            (report.condition && report.condition.toLowerCase().includes(searchTerm)) ||
            (report.patientId && report.patientId.toLowerCase().includes(searchTerm)) ||
            (report.summary && report.summary.toLowerCase().includes(searchTerm)) ||
            (report.title && report.title.toLowerCase().includes(searchTerm)) || // Added title to search
            (report.type && report.type.toLowerCase().includes(searchTerm))      // Added type to search
        );

        renderSchedule(filteredSchedule);
        renderPatientReports(filteredReports);
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

function updateStats(schedule, reports) {
    if (todayAppointmentsElement) {
        // Assuming 'todayAppointments' refers to schedule.length
        todayAppointmentsElement.textContent = schedule.length;
    }
    if (totalPatientsElement) {
        // Count unique patients from reports and schedule
        const uniquePatientIdsFromReports = new Set(reports.map(report => report.patientId));
        const uniquePatientIdsFromSchedule = new Set(schedule.map(appt => appt.patientId));
        const allUniquePatientIds = new Set([...Array.from(uniquePatientIdsFromReports), ...Array.from(uniquePatientIdsFromSchedule)]);
        totalPatientsElement.textContent = allUniquePatientIds.size;
    }
    if (pendingReportsElement) {
        // Count reports with urgency 'high' or status 'pending'
        pendingReportsElement.textContent = reports.filter(r => r.urgency === 'high' || (r.status && r.status.toLowerCase() === 'pending')).length;
    }
    if (upcomingAppointmentsElement) {
        // For demonstration, let's make it a count of future appointments in the schedule
        const now = new Date();
        const upcoming = schedule.filter(apt => {
            const apptDate = new Date(apt.date + 'T' + apt.time); // Combine date and time for comparison
            return apptDate > now && apt.status !== 'completed';
        }).length;
        upcomingAppointmentsElement.textContent = upcoming.toString();
    }

// Removed Add Report Modal Functions as it's now a separate page
// function openAddReportModal() { ... }
// function closeAddReportModal() { ... }
// function populatePatientDropdown(patients) { ... }
// if (addReportForm) { ... }


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
                currentDoctor = doctorData;
                showDashboard();
            } else {
                console.error('Doctor re-authentication failed or data mismatch.');
                logout(); // Clear invalid state
            }
        })
        .catch(error => {
            console.error('Error during doctor re-authentication:', error);
            logout(); // Clear state on network/API error
        });
    } else {
        showAuth(); // No stored credentials, show login/register
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Initial check for authentication status

    // Attach dashboard search and tab listeners
    const tabButtonsContainer = document.querySelector('.tabs');
    if (tabButtonsContainer) {
        tabButtonsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                // When a tab is clicked, re-run setupTabs to ensure active class is set
                setupTabs();
            }
        });
    }

    // Removed "Add New Report" button listener as it's now an <a> tag
    // if (addNewReportBtn) { addNewReportBtn.addEventListener('click', openAddReportModal); }

    // Removed Close Add Report modal listener
    // if (addReportModal) { addReportModal.addEventListener('click', function(e) { ... }); }

    // Removed Add Report Form Submission listener
    // if (addReportForm) { addReportForm.addEventListener('submit', async (e) => { ... }); }


    // Attach logout listener
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
        });
    }
});