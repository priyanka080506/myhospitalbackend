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
const doctorHospitalDisplay = document.getElementById('doctorHospitalDisplay');


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
            // UPDATED URL: /api/doctors/login
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

        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const phone = phoneInput ? phoneInput.value : '';
        const specialty = specialtyInput ? specialtyInput.value : '';
        const license = licenseInput ? licenseInput.value : '';
        // FIX: Corrected the assignment for 'password'
        const password = passwordInput ? passwordInput.value : ''; // Corrected line
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

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        try {
            // UPDATED URL: /api/doctors/register
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
        if (loginFormElement) loginFormElement.reset(); // Clear forms
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
        if (doctorHospitalDisplay) {
            if (currentDoctor.workingPlaces && currentDoctor.workingPlaces.length > 0) {
                doctorHospitalDisplay.textContent = currentDoctor.workingPlaces[0].place; // Display first working place
            } else {
                doctorHospitalDisplay.textContent = 'N/A';
            }
        }


        // Populate working places dynamically
        if (workingPlacesContainer) {
            workingPlacesContainer.innerHTML = ''; // Clear existing
            currentDoctor.workingPlaces?.forEach(wp => {
                const row = document.createElement('div');
                row.className = 'working-place-row';
                row.innerHTML = `
                    <input type="text" class="working-place-input" value="${wp.place}" readonly>
                    <input type="text" class="working-timing-input" value="${wp.timing}" readonly>
                `;
                workingPlacesContainer.appendChild(row);
            });
            // Add an empty row for new input if no places or if we want to allow adding
            if (!currentDoctor.workingPlaces || currentDoctor.workingPlaces.length === 0) {
                 const newRow = document.createElement('div');
                 newRow.className = 'working-place-row';
                 newRow.innerHTML = `
                     <input type="text" class="working-place-input" placeholder="e.g., City General Hospital" required>
                     <input type="text" class="working-timing-input" placeholder="e.g., Mon 9AM-5PM" required>
                     <button type="button" class="remove-input-button" style="display:none;"><i class="fas fa-times-circle"></i></button>
                 `;
                 if (workingPlacesContainer) workingPlacesContainer.appendChild(newRow);
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
                // If you were storing doctors in localStorage, you'd update it here:
                // const doctors = JSON.parse(localStorage.getItem('doctors')) || [];
                // const doctorIndex = doctors.findIndex(doc => doc.email === currentDoctor.email);
                // if (doctorIndex !== -1) {
                //     doctors[doctorIndex].photo = e.target.result;
                //     localStorage.setItem('doctors', JSON.stringify(doctors));
                // }
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
        // UPDATED URL: /api/doctors/schedule/:doctorId
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
        // UPDATED URL: /api/doctors/patient-reports/:doctorId
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
        patientsList.innerHTML = '<p class="no-data-message">No patient reports found.</p>';
        return;
    }

    patientsList.innerHTML = reports.map(report => `
        <div class="card">
            <div class="patient-header">
                <div class="patient-name-section">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="patient-name">${report.patient || 'N/A'}</div>
                        <div class="patient-id">${report.patientId || 'N/A'}</div>
                    </div>
                </div>
                <span class="urgency-badge ${report.urgency?.toLowerCase() || ''}">${report.urgency?.toUpperCase() || 'N/A'}</span>
            </div>

            <div class="patient-info">
                <div class="patient-detail">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <span class="label">Last Visit</span>
                        <div class="value">${formatDate(report.lastVisit)}</div>
                    </div>
                </div>
                <div class="patient-detail">
                    <i class="fas fa-heartbeat"></i>
                    <div>
                        <span class="label">Condition</span>
                        <div class="value">${report.condition || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="report-summary">
                <p><strong>Summary:</strong> ${report.summary || 'No summary available.'}</p>
                <p><strong>Next Action:</strong> ${report.nextAction || 'N/A'}</p>
            </div>

            <div class="action-buttons">
                <button class="action-button primary">
                    <i class="fas fa-edit"></i>
                    Update Report
                </button>
                <button class="action-button">
                    <i class="fas fa-eye"></i>
                    View History
                </button>
                <button class="action-button">
                    <i class="fas fa-phone"></i>
                    Contact
                </button>
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
            (report.summary && report.summary.toLowerCase().includes(searchTerm))
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
        const uniquePatientIds = new Set(reports.map(report => report.patientId));
        totalPatientsElement.textContent = uniquePatientIds.size;
    }
    if (pendingReportsElement) {
        // Count reports with urgency 'high' or status 'pending'
        pendingReportsElement.textContent = reports.filter(r => r.urgency === 'high' || (r.status && r.status.toLowerCase() === 'pending')).length;
    }
    if (upcomingAppointmentsElement) {
        // This was hardcoded to '12' in your original. If it should be dynamic,
        // you'd need to filter 'schedule' for upcoming appointments based on date.
        // For now, keeping it as is or deriving from schedule if possible.
        // For demonstration, let's make it a count of future appointments in the schedule
        const now = new Date();
        const upcoming = schedule.filter(apt => {
            // Assuming appointment.date is available for future appointments in the schedule
            const apptDate = new Date(apt.date + 'T' + apt.time); // Combine date and time for comparison
            return apptDate > now && apt.status !== 'completed';
        }).length;
        upcomingAppointmentsElement.textContent = upcoming.toString();
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    try {
        // Ensure date is treated as UTC to avoid timezone issues with `new Date()` parsing
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        console.error('Invalid date string for formatting:', dateString, e);
        return dateString;
    }
}

// --- Initial App Load & Authentication Check (Backend Integration) ---
function checkAuth() {
    const loggedInEmail = localStorage.getItem('currentLoggedInDoctorEmail');
    const authToken = localStorage.getItem('authToken');

    if (loggedInEmail && authToken) {
        // Attempt to re-authenticate using the stored email and token
        // UPDATED URL: /api/doctors/profile?email=${loggedInEmail}
        fetch(`${BASE_URL}/api/doctors/profile?email=${loggedInEmail}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) {
                // If token is invalid or expired, or profile not found
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
    const tabButtonsContainer = document.querySelector('.tabs'); // Assuming .tabs is the container for tab-buttons
    if (tabButtonsContainer) {
        tabButtonsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                setupTabs(); // Re-run setupTabs to activate the clicked tab
            }
        });
    }
    if (searchInput) {
        // setupSearch needs to be called with actual data after it's fetched by initializeDashboardContent
        // The listener is attached here, but the data it filters will be the ones loaded by initializeDashboardContent
    }

    // Attach logout listener
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout();
        });
    }
});
