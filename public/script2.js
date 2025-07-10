// Base URL for your API (adjust if your backend is on a different port/domain)
const BASE_URL = 'http://localhost:3000'; // Example: ensure this matches your backend

// --- Authentication Elements ---
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginFormElement = document.getElementById('loginForm');
const registerFormElement = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const logoutButton = document.getElementById('logoutButton');

// --- Dashboard Display Elements ---
const patientAvatar = document.getElementById('patientAvatar');
const patientNameElement = document.getElementById('patientName');
const patientIDElement = document.getElementById('patientID');
const patientEmailElement = document.getElementById('patientEmail');
const patientPhoneElement = document.getElementById('patientPhone');
const patientDOBDisplayElement = document.getElementById('patientDOBDisplay');
const patientAddressElement = document.getElementById('patientAddress');

// --- Dashboard Stats Elements ---
const upcomingAppointmentsCountElement = document.getElementById('upcomingAppointmentsCount');
const totalReportsCountElement = document.getElementById('totalReportsCount');
const lastVisitDateElement = document.getElementById('lastVisitDate');
const nextAppointmentDateElement = document.getElementById('nextAppointmentDate');

// --- Tab Elements ---
const tabs = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const appointmentsList = document.getElementById('appointmentsList');
const reportsList = document.getElementById('reportsList');
const noAppointmentsMessage = document.getElementById('noAppointmentsMessage');
const noReportsMessage = document.getElementById('noReportsMessage');

const appointmentsCountSpan = document.getElementById('appointmentsCountSpan');
const reportsCountSpan = document.getElementById('reportsCountSpan');

// --- Search Element ---
const searchInput = document.getElementById('searchInput');

// --- Report Image Modal Elements ---
const reportImageModal = document.getElementById('reportImageModal');
const reportImageDisplay = document.getElementById('reportImageDisplay');
const closeReportImageModalBtn = document.getElementById('closeReportImageModal');

// --- Appointment Booking Modal Elements (Directly from index2.html) ---
const bookAppointmentBtn = document.getElementById('bookAppointmentBtn'); // The blue button
const bookingModal = document.getElementById('bookingModal'); // The modal container itself
const closeBookingModalBtn = document.getElementById('closeBookingModal');
const progressBar = document.getElementById('progressBar');
const formSteps = document.querySelectorAll('.form-step'); // All steps (step1, step2, step3)
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const bookingForm = document.getElementById('bookingForm');
const summaryContent = document.getElementById('summaryContent');

// --- NEW: Add Report Button Element ---
const addReportBtn = document.getElementById('addReportBtn'); // The new add report button

// Global variable to store current user details
let currentUser = null;
let currentStep = 1; // For multi-step booking form
const totalSteps = 3;

// --- Utility Functions ---

function showAuthSection() {
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
}

function showDashboardSection() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
}

function saveToken(token) {
    localStorage.setItem('jwtToken', token);
}

function getToken() {
    return localStorage.getItem('jwtToken');
}

function removeToken() {
    localStorage.removeItem('jwtToken');
}

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Something went wrong!' }));
        throw new Error(errorData.message || 'Network response was not ok.');
    }
    return response.json();
}

function updateDashboardPatientInfo(patient) {
    patientAvatar.textContent = (patient.firstName[0] + patient.lastName[0]).toUpperCase();
    patientNameElement.textContent = `${patient.firstName} ${patient.lastName}`;
    patientIDElement.textContent = patient.patientId || 'N/A';
    patientEmailElement.textContent = patient.email;
    patientPhoneElement.textContent = patient.phone || 'N/A';
    patientDOBDisplayElement.textContent = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A';
    patientAddressElement.textContent = patient.address || 'N/A';

    // Store current user for booking modal pre-fill
    currentUser = patient;
    // Store patientId in localStorage for report.html to access
    localStorage.setItem('currentPatientId', patient._id);
}

function displayAppointments(appointments) {
    appointmentsList.innerHTML = ''; // Clear previous appointments

    if (!appointments || appointments.length === 0) {
        noAppointmentsMessage.style.display = 'block';
        appointmentsCountSpan.textContent = '0';
        return;
    }

    noAppointmentsMessage.style.display = 'none';
    appointmentsCountSpan.textContent = appointments.length;

    const sortedAppointments = appointments.sort((a, b) => new Date(a.appointmentDate + ' ' + a.appointmentTime) - new Date(b.appointmentDate + ' ' + b.appointmentTime));

    let upcomingCount = 0;
    let lastVisit = null;
    let nextAppointment = null;
    const now = new Date();

    sortedAppointments.forEach(app => {
        const appointmentDateTime = new Date(`${app.appointmentDate}T${app.appointmentTime}`);

        // Update counts and quick stats
        if (appointmentDateTime > now && app.status !== 'Cancelled' && app.status !== 'Completed') {
            upcomingCount++;
            if (!nextAppointment || appointmentDateTime < nextAppointment.date) {
                nextAppointment = { date: appointmentDateTime, status: app.status };
            }
        }
        if (appointmentDateTime < now && app.status === 'Completed') {
            if (!lastVisit || appointmentDateTime > lastVisit) {
                lastVisit = appointmentDateTime;
            }
        }

        const appointmentCard = document.createElement('div');
        appointmentCard.classList.add('card', 'appointment-card');

        let statusClass = '';
        if (app.status === 'Completed') {
            statusClass = 'completed';
        } else if (app.status === 'Pending' || app.status === 'Scheduled') {
            statusClass = 'pending';
        } else if (app.status === 'Cancelled') {
            statusClass = 'cancelled';
        }

        let typeClass = '';
        if (app.service) {
            if (app.service.toLowerCase().includes('consultation')) {
                typeClass = 'consultation';
            } else if (app.service.toLowerCase().includes('dental')) { // Added check for dental
                typeClass = 'dental';
            } else if (app.service.toLowerCase().includes('physiotherapy')) { // Added check for physiotherapy
                typeClass = 'physiotherapy';
            } else if (app.service.toLowerCase().includes('cardiology')) { // Added check for cardiology
                typeClass = 'cardiology';
            } else if (app.service.toLowerCase().includes('dermatology')) { // Added check for dermatology
                typeClass = 'dermatology';
            }
            else {
                typeClass = 'general';
            }
        }

        appointmentCard.innerHTML = `
            <div class="appointment-header">
                <div>
                    <div class="appointment-date">
                        <i class="far fa-calendar-alt"></i>
                        <span class="date">${new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div class="appointment-time">
                        <i class="far fa-clock"></i>
                        <span>${app.appointmentTime}</span>
                    </div>
                </div>
                <div class="appointment-badges">
                    <span class="status-badge ${statusClass}">${app.status}</span>
                    <span class="type-badge ${typeClass}">${app.service}</span>
                </div>
            </div>
            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-user-md"></i>
                    <span class="label">Doctor:</span>
                    <span class="value">${app.doctor || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-hospital"></i>
                    <span class="label">Location:</span>
                    <span class="value">${app.location || 'Clinic A'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-id-card"></i>
                    <span class="label">Booking ID:</span>
                    <span class="value">${app._id.substring(0, 8)}</span>
                </div>
            </div>
            ${app.notes ? `
            <div class="appointment-notes">
                <div class="notes-header">
                    <i class="fas fa-clipboard"></i>
                    <span class="notes-title">Notes:</span>
                </div>
                <p class="notes-content">${app.notes}</p>
            </div>` : ''}
            <button class="view-button">
                <i class="fas fa-info-circle"></i> View Details
            </button>
        `;
        appointmentsList.appendChild(appointmentCard);
    });

    upcomingAppointmentsCountElement.textContent = upcomingCount;
    lastVisitDateElement.textContent = lastVisit ? lastVisit.toLocaleDateString() : 'N/A';
    nextAppointmentDateElement.textContent = nextAppointment ? `${nextAppointment.date.toLocaleDateString()} at ${nextAppointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A';
}

function displayReports(reports) {
    reportsList.innerHTML = ''; // Clear previous reports

    if (!reports || reports.length === 0) {
        noReportsMessage.style.display = 'block';
        reportsCountSpan.textContent = '0';
        return;
    }

    noReportsMessage.style.display = 'none';
    reportsCountSpan.textContent = reports.length;

    reports.forEach(report => {
        const reportCard = document.createElement('div');
        reportCard.classList.add('card', 'report-card');

        let reportIconClass = '';
        let reportTypeBadgeClass = '';
        if (report.type === 'Laboratory') {
            reportIconClass = 'fas fa-flask';
            reportTypeBadgeClass = 'laboratory';
        } else if (report.type === 'Radiology') {
            reportIconClass = 'fas fa-x-ray';
            reportTypeBadgeClass = 'radiology';
        } else if (report.type === 'Cardiology') {
            reportIconClass = 'fas fa-heartbeat';
            reportTypeBadgeClass = 'cardiology';
        } else {
            reportIconClass = 'fas fa-file-alt'; // Default icon
            reportTypeBadgeClass = 'general'; // Default badge type
        }

        reportCard.innerHTML = `
            <div class="report-header">
                <div class="report-title-section">
                    <i class="${reportIconClass} report-icon"></i>
                    <div>
                        <h3 class="report-title">${report.title}</h3>
                        <p class="report-date"><i class="far fa-calendar-alt"></i> ${new Date(report.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <span class="report-type-badge ${reportTypeBadgeClass}">${report.type}</span>
            </div>
            <p class="report-doctor"><i class="fas fa-user-md"></i> Dr. ${report.doctorName}</p>
            ${report.summary ? `
            <div class="report-summary">
                <p>${report.summary}</p>
            </div>` : ''}
            <div class="report-footer">
                <span class="final-badge">${report.status || 'Final'}</span>
                <div class="report-actions">
                    ${report.imageUrl ? `
                    <button class="action-button view" onclick="window.openReportImageModal('${report.imageUrl}')">
                        <i class="fas fa-eye"></i> View
                    </button>` : ''}
                    ${report.fileUrl ? `
                    <a href="${report.fileUrl}" target="_blank" class="action-button download">
                        <i class="fas fa-download"></i> Download
                    </a>` : ''}
                </div>
            </div>
        `;
        reportsList.appendChild(reportCard);
    });
}

// Global functions for report image modal (accessible from onclick in HTML)
window.openReportImageModal = (imageUrl) => {
    reportImageDisplay.src = imageUrl;
    reportImageModal.classList.add('active');
};

window.closeReportImageModal = () => {
    reportImageModal.classList.remove('active');
    reportImageDisplay.src = ''; // Clear image source
};

// --- Data Fetching Functions ---

async function fetchPatientData(patientId) {
    const token = getToken();
    if (!token) {
        showAuthSection();
        return;
    }
    try {
        const response = await fetch(`${BASE_URL}/api/patients/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await handleResponse(response);
        updateDashboardPatientInfo(data);
    } catch (error) {
        console.error('Error fetching patient data:', error);
        // If token is invalid or expired, log out
        removeToken();
        localStorage.removeItem('currentPatientId'); // Clear patient ID as well
        showAuthSection();
    }
}

async function fetchAppointments(patientId) {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetch(`${BASE_URL}/api/appointments/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await handleResponse(response);
        displayAppointments(data);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        displayAppointments([]); // Show empty state on error
    }
}

async function fetchReports(patientId) {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetch(`${BASE_URL}/api/reports/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await handleResponse(response);
        displayReports(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        displayReports([]); // Show empty state on error
    }
}

// --- Appointment Booking Modal Logic ---

function openBookingModal() {
    // Pre-fill patient details from currentUser
    if (currentUser) {
        document.getElementById('bookingFirstName').value = currentUser.firstName || '';
        document.getElementById('bookingLastName').value = currentUser.lastName || '';
        document.getElementById('bookingEmail').value = currentUser.email || '';
        document.getElementById('bookingPhone').value = currentUser.phone || '';
        document.getElementById('bookingAddress').value = currentUser.address || '';
    }

    currentStep = 1; // Reset to first step
    showStep(currentStep);
    bookingModal.classList.add('active'); // Display modal
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingForm.reset(); // Clear form fields
}

function showStep(step) {
    formSteps.forEach((s, index) => {
        s.classList.toggle('active', index + 1 === step);
    });

    // Update progress bar
    const progressSteps = progressBar.querySelectorAll('.progress-step');
    progressSteps.forEach((p, index) => {
        p.classList.toggle('active', index + 1 <= step);
    });

    // Update navigation buttons
    updateNavigationButtons();

    // If it's the summary step, populate content
    if (step === totalSteps) {
        populateSummary();
    }
}

function updateNavigationButtons() {
    backBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
    submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    // Adjust layout for submit button to take full width if needed
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none'; // Ensure next is hidden on summary
        backBtn.parentNode.style.justifyContent = 'flex-end'; // Push submit to right
        submitBtn.style.marginLeft = 'auto'; // If submit needs to be right-aligned
    } else {
        backBtn.parentNode.style.justifyContent = 'space-between';
        submitBtn.style.marginLeft = '0';
    }
}

function validateStep(step) {
    let isValid = true;
    const currentFormStep = document.getElementById(`step${step}`);
    const inputs = currentFormStep.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid'); // Add a class for invalid styling
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    // Simple email validation for bookingEmail if it's editable
    const bookingEmailInput = currentFormStep.querySelector('#bookingEmail');
    if (bookingEmailInput && bookingEmailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmailInput.value)) {
        bookingEmailInput.classList.add('is-invalid');
        isValid = false;
    }

    // Basic date validation for bookingDate (ensure not past date if applicable)
    const bookingDateInput = currentFormStep.querySelector('#bookingDate');
    if (bookingDateInput && bookingDateInput.value) {
        const selectedDate = new Date(bookingDateInput.value);
        selectedDate.setHours(0,0,0,0); // Normalize to start of day
        const today = new Date();
        today.setHours(0,0,0,0); // Normalize to start of day
        if (selectedDate < today) {
            bookingDateInput.classList.add('is-invalid');
            isValid = false;
            alert('Appointment date cannot be in the past.'); // Provide user feedback
        } else {
            bookingDateInput.classList.remove('is-invalid');
        }
    }


    return isValid;
}

function populateSummary() {
    document.getElementById('summaryPatientName').textContent = `${document.getElementById('bookingFirstName').value} ${document.getElementById('bookingLastName').value}`;
    document.getElementById('summaryPatientEmail').textContent = document.getElementById('bookingEmail').value;
    document.getElementById('summaryService').textContent = document.getElementById('bookingService').value;
    document.getElementById('summaryDoctor').textContent = document.getElementById('bookingDoctor').value;
    document.getElementById('summaryDate').textContent = document.getElementById('bookingDate').value;
    document.getElementById('summaryTime').textContent = document.getElementById('bookingTime').value;
    document.getElementById('summaryNotes').textContent = document.getElementById('bookingNotes').value || 'No notes provided.';
}

// --- Event Listeners ---

// Initial check on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    const patientId = localStorage.getItem('currentPatientId'); // Get patientId from local storage

    if (token && patientId) {
        showDashboardSection();
        fetchPatientData(patientId);
        fetchAppointments(patientId);
        fetchReports(patientId);
    } else {
        // This is the corrected line that was likely causing "logout is not defined" error
        showAuthSection();
    }
});

// Auth form switching
showRegisterBtn.addEventListener('click', () => {
    loginFormElement.classList.remove('active');
    registerFormElement.classList.add('active');
});

showLoginBtn.addEventListener('click', () => {
    registerFormElement.classList.remove('active');
    loginFormElement.classList.add('active');
});

// Login Form Submission
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await handleResponse(response);
        saveToken(data.token);
        localStorage.setItem('currentPatientId', data.patient._id); // Store patient ID
        updateDashboardPatientInfo(data.patient);
        showDashboardSection();
        fetchAppointments(data.patient._id); // Fetch appointments for the logged-in patient
        fetchReports(data.patient._id); // Fetch reports for the logged-in patient
    } catch (error) {
        alert(error.message);
        console.error('Login error:', error);
    }
});

// Registration Form Submission
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const dateOfBirth = document.getElementById('registerDOB').value;
    const address = document.getElementById('registerAddress').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, phone, dateOfBirth, address, password })
        });

        const data = await handleResponse(response);
        alert('Registration successful! Please log in.');
        loginFormElement.classList.add('active');
        registerFormElement.classList.remove('active');
        document.getElementById('loginEmail').value = email; // Pre-fill login email
    } catch (error) {
        alert(error.message);
        console.error('Registration error:', error);
    }
});

// Logout Button
logoutButton.addEventListener('click', () => {
    removeToken();
    localStorage.removeItem('currentPatientId'); // Clear patient ID on logout
    showAuthSection();
    loginFormElement.classList.add('active'); // Show login form after logout
    registerFormElement.classList.remove('active');
});

// Tab switching logic
tabs.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;

        tabs.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        // Re-fetch data if needed, or just ensure display is correct
        const patientId = localStorage.getItem('currentPatientId');
        if (patientId) {
            if (targetTab === 'appointmentsTab') {
                fetchAppointments(patientId);
            } else if (targetTab === 'reportsTab') {
                fetchReports(patientId);
            }
        }
    });
});

// Search input functionality (client-side filtering for simplicity)
searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;

    if (activeTab === 'appointmentsTab') {
        appointmentsList.querySelectorAll('.appointment-card').forEach(card => {
            const textContent = card.textContent.toLowerCase();
            card.style.display = textContent.includes(searchTerm) ? 'flex' : 'none';
        });
    } else if (activeTab === 'reportsTab') {
        reportsList.querySelectorAll('.report-card').forEach(card => {
            const textContent = card.textContent.toLowerCase();
            card.style.display = textContent.includes(searchTerm) ? 'block' : 'none'; // Reports are block by default
        });
    }
});


// --- Appointment Booking Modal Event Listeners ---
bookAppointmentBtn.addEventListener('click', openBookingModal);
closeBookingModalBtn.addEventListener('click', closeBookingModal);
window.addEventListener('click', (event) => { // Close modal when clicking outside
    if (event.target === bookingModal) {
        closeBookingModal();
    }
    if (event.target === reportImageModal) { // Close report image modal too
        window.closeReportImageModal();
    }
});

// Booking form navigation
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    } else {
        alert('Please fill in all required fields.'); // Basic feedback for validation
    }
});

backBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});

// Booking form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!validateStep(currentStep)) {
        alert('Please review the form for errors.');
        return;
    }

    // Collect data from all steps
    const appointmentData = {
        patientId: localStorage.getItem('currentPatientId'), // Get patient ID
        firstName: document.getElementById('bookingFirstName').value,
        lastName: document.getElementById('bookingLastName').value,
        email: document.getElementById('bookingEmail').value,
        phone: document.getElementById('bookingPhone').value,
        address: document.getElementById('bookingAddress').value,
        service: document.getElementById('bookingService').value,
        doctor: document.getElementById('bookingDoctor').value,
        appointmentDate: document.getElementById('bookingDate').value,
        appointmentTime: document.getElementById('bookingTime').value,
        notes: document.getElementById('bookingNotes').value,
        status: 'Pending' // Default status for new appointments
    };

    const token = getToken();
    if (!token) {
        alert('Authentication required. Please log in.');
        showAuthSection();
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });

        if (response.ok) {
            alert('Appointment booked successfully!');
            closeBookingModal();
            fetchAppointments(appointmentData.patientId); // Refresh appointments list
        } else {
            const errorData = await response.json();
            alert(`Failed to book appointment: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('An error occurred. Please try again later.');
    }
});

// --- NEW: Add Report Button Listener ---
addReportBtn.addEventListener('click', () => {
    window.location.href = 'report.html'; // Redirect to the new report page
});