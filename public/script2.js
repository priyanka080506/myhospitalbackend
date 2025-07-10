// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// Authentication state
let currentPatient = null; // Stores patient data upon successful login

// DOM elements for Auth Section
const authSection = document.getElementById('authSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

// DOM elements for Dashboard Header
const logoutButton = document.getElementById('logoutButton');
const patientNameElement = document.getElementById('patientName');
const patientIdDisplay = document.getElementById('patientIdDisplay');
const patientEmail = document.getElementById('patientEmail');
const patientPhoneDisplay = document.getElementById('patientPhoneDisplay');
const patientDOBDisplay = document.getElementById('patientDOBDisplay');
const patientGenderDisplay = document.getElementById('patientGenderDisplay');

// DOM elements for Patient Photo
const patientPhotoElement = document.getElementById('patientPhoto');
const photoUploadInput = document.getElementById('photoUploadInput');

// DOM elements for Dashboard Stats
const upcomingAppointmentsElement = document.getElementById('upcomingAppointments');
const totalReportsElement = document.getElementById('totalReports');
const lastVisitDateElement = document.getElementById('lastVisitDate');
const nextAppointmentDateElement = document.getElementById('nextAppointmentDate');

// DOM elements for Search and Tabs
const searchInput = document.getElementById('searchInput');
const appointmentsList = document.getElementById('appointmentsList');
const appointmentsCount = document.getElementById('appointmentsCount');
const reportsList = document.getElementById('reportsList');
const reportsCount = document.getElementById('reportsCount');

// DOM elements for Booking Modal (reused from index.html)
const bookingModal = document.getElementById('bookingModal');
const bookingFormElement = document.getElementById('bookingForm');
const appointmentDateInput = document.getElementById('appointmentDate');
const serviceSelect = document.getElementById('service');
const doctorSelect = document.getElementById('doctor');
const summaryContentElement = document.getElementById('summaryContent');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Report Image Modal Elements
const reportImageModal = document.getElementById('reportImageModal');
const reportImageDisplay = document.getElementById('reportImageDisplay');

// Global variables for booking modal steps
let currentStep = 1;
const totalSteps = 3;

// Mock Data (replace with fetches from your backend later)
const servicesData = [
    {
        icon: 'fas fa-heart',
        title: 'Cardiology',
        description: 'Comprehensive heart care including diagnostics, treatment, and prevention of cardiovascular diseases.',
        features: ['ECG & Echo', 'Heart Surgery', 'Preventive Care']
    },
    {
        icon: 'fas fa-brain',
        title: 'Neurology',
        description: 'Specialized care for brain, spine, and nervous system disorders with advanced treatment options.',
        features: ['Brain Imaging', 'Neurological Exams', 'Treatment Plans']
    },
    {
        icon: 'fas fa-bone',
        title: 'Orthopedics',
        description: 'Expert treatment for bone, joint, and muscle conditions with both surgical and non-surgical options.',
        features: ['Joint Replacement', 'Sports Medicine', 'Rehabilitation']
    },
    {
        icon: 'fas fa-eye',
        title: 'Surgeon',
        description: 'Wide range of surgical operations, using various techniques and tools, to address a variety of conditions.',
        features: ['3D Visualization', 'Rehabilation', 'Triage Tool']
    },
    {
        icon: 'fas fa-baby',
        title: 'Pediatrics',
        description: 'Specialized healthcare for infants, children, and adolescents with compassionate care.',
        features: ['Well-child Visits', 'Vaccinations', 'Growth Monitoring']
    },
    {
        icon: 'fas fa-stethoscope',
        title: 'Dermatology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 203,
        image: 'adhi.jpg.jpeg',
        education: 'Christian Medical College Vellore',
        availability: 'JSS Hospital - Tue, Thu, Fri',
        features: ['Teledermatology', 'Digital grafing', 'Comparision Imaging']
    }
];

const doctorsData = [
    {
        name: 'Dr. Ajanya',
        specialty: 'Cardiology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 127,
        image: 'Ajanya.jpg.jpeg',
        education: 'Harvard Medical School',
        availability: 'Jayadeva Hospital - Mon, Wed, Fri',
        _id: 'doc1' // Mock ID
    },
    {
        name: 'Dr. Brunda',
        specialty: 'Neurology',
        experience: '6+ Years',
        rating: 4.8,
        reviews: 269,
        image: 'brunda.jpg.jpeg',
        education: 'Madras Medical College',
        availability: 'Manipal Hospital - Tue, Thu, Sat',
        _id: 'doc2' // Mock ID
    },
    {
        name: 'Dr. Ashwin',
        specialty: 'Pediatrics',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 156,
        image: 'ashwin.jpg.jpeg',
        education: 'St. Johns Medical college',
        availability: 'Suraksha Hospital - Mon, Tue, Thu',
        _id: 'doc3' // Mock ID
    },
    {
        name: 'Dr. Madhukumar',
        specialty: 'Orthopedics',
        experience: '5+ Years',
        rating: 4.7,
        reviews: 89,
        image: 'madhukumar.jpg.jpeg',
        education: 'JSS Medical College Mysore',
        availability: 'A R Hospital - Wed, Fri, Sat',
        _id: 'doc4' // Mock ID
    },
    {
        name: 'Dr. Prasanna',
        specialty: 'Surgeon',
        experience: '10+ Years',
        rating: 4.8,
        reviews: 112,
        image: 'prasanna.jpg.jpeg',
        education: 'Stanley Medical College',
        availability: 'Sigma Hospital - Mon, Wed, Fri',
        _id: 'doc5' // Mock ID
    },
    {
        name: 'Dr. Adhi',
        specialty: 'Dermatology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 203,
        image: 'adhi.jpg.jpeg',
        education: 'Christian Medical College Vellore',
        availability: 'JSS Hospital - Tue, Thu, Fri',
        _id: 'doc6' // Mock ID
    }
];


// --- Helper Functions ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
        case 'Symptoms Log': return '<i class="fas fa-notes-medical"></i>';
        case 'Home Monitoring': return '<i class="fas fa-heartbeat"></i>';
        case 'Questionnaire': return '<i class="fas fa-clipboard-question"></i>';
        case 'Other': return '<i class="fas fa-file-medical"></i>';
        default: return '<i class="fas fa-file-alt"></i>';
    }
}

// Set the minimum date for the appointment date input to today
function setMinDate() {
    if (appointmentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.setAttribute('min', today);
    }
}

// --- UI/Modal Functions (Authentication) ---
function showAuth() {
    if (authSection) authSection.style.display = 'flex';
    if (mainDashboard) mainDashboard.style.display = 'none';
    if (loginFormElement) loginFormElement.classList.add('active');
    if (registerFormElement) registerFormElement.classList.remove('active');
}

async function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'block';

    if (currentPatient) {
        if (patientNameElement) patientNameElement.textContent = currentPatient.name || 'Patient';
        if (patientIdDisplay) patientIdDisplay.textContent = `ID: ${currentPatient._id ? currentPatient._id.substring(0, 8) + '...' : 'N/A'}`;
        if (patientEmail) patientEmail.textContent = currentPatient.email || 'N/A';
        if (patientPhoneDisplay) patientPhoneDisplay.textContent = currentPatient.phone || 'N/A';
        if (patientDOBDisplay) patientDOBDisplay.textContent = `DOB: ${formatDate(currentPatient.dob) || 'N/A'}`;
        if (patientGenderDisplay) patientGenderDisplay.textContent = `Gender: ${currentPatient.gender || 'N/A'}`;
        if (patientPhotoElement) patientPhotoElement.src = currentPatient.photo || 'https://placehold.co/100x100/e0e7ff/0275f7?text=PT';
    }

    await initializeDashboardContent();
}

// --- Photo Upload Logic (Client-Side Only for Mock) ---
if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(e) {
            if (patientPhotoElement) patientPhotoElement.src = e.target.result;
            // In a real application, you would upload this file to your backend
            // and then update the patient's profile on the server.
            // For now, we'll just update the client-side currentPatient object
            if (currentPatient) {
                currentPatient.photo = e.target.result;
            }
        };

        reader.readAsDataURL(file);
        alert('Profile photo updated (client-side only)! In a real app, this would be uploaded to the server.');
    });
}

// --- UI/Modal Functions (Booking Modal) ---
function openBookingModal() {
    if (bookingModal) {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        populateServiceDropdown();
        populateDoctorDropdown();
        prefillPatientInfo(); // Prefill patient data if logged in
        updateStep(); // Reset to step 1 and update UI
    }
}

function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow background scrolling
        resetBookingForm(); // Reset form state when modal closes
    }
}

function updateStep() {
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });

    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentStep);
    });

    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.toggle('active', index + 1 < currentStep);
    });

    if (backBtn) backBtn.style.display = currentStep > 1 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
    if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return true;

    const requiredInputs = currentStepElement.querySelectorAll('input[required]:not([readonly]), select[required]:not([readonly]), textarea[required]:not([readonly])');

    let isValid = true;
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444'; // Highlight invalid fields
            isValid = false;
        } else {
            input.style.borderColor = '#e2e8f0'; // Reset border for valid fields
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields for this step.');
    }
    return isValid;
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
            if (currentStep === totalSteps) {
                updateSummary();
            }
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

function updateSummary() {
    if (!bookingFormElement || !summaryContentElement) return;

    const formData = new FormData(bookingFormElement);

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const service = formData.get('service');
    const doctor = formData.get('doctor');
    const appointmentDate = formData.get('appointmentDate');
    const appointmentTime = formData.get('appointmentTime');
    const notes = formData.get('notes');

    summaryContentElement.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Patient:</span>
            <span class="summary-value">${firstName} ${lastName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Email:</span>
            <span class="summary-value">${email}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Phone:</span>
            <span class="summary-value">${phone}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Address:</span>
            <span class="summary-value">${address || 'N/A'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Service:</span>
            <span class="summary-value">${service}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Doctor:</span>
            <span class="summary-value">${doctor}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Date & Time:</span>
            <span class="summary-value">${formatDate(appointmentDate)} at ${appointmentTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Notes:</span>
            <span class="summary-value">${notes || 'N/A'}</span>
        </div>
    `;
}

function resetBookingForm() {
    currentStep = 1;
    if (bookingFormElement) {
        bookingFormElement.reset();
        updateStep();
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
    }
}

function prefillPatientInfo() {
    if (currentPatient) {
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const addressInput = document.getElementById('address'); // Assuming you have an address field

        if (firstNameInput) firstNameInput.value = currentPatient.name.split(' ')[0] || '';
        if (lastNameInput) lastNameInput.value = currentPatient.name.split(' ').slice(1).join(' ') || '';
        if (emailInput) emailInput.value = currentPatient.email || '';
        if (phoneInput) phoneInput.value = currentPatient.phone || '';
        if (addressInput) addressInput.value = currentPatient.address || ''; // Populate if address exists in patient model
    }
}

function populateServiceDropdown() {
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select a Service</option>';
        servicesData.forEach(service => {
            const option = document.createElement('option');
            option.value = service.title;
            option.textContent = service.title;
            serviceSelect.appendChild(option);
        });
    }
}

function populateDoctorDropdown() {
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">Any Doctor</option>';
        doctorsData.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.name;
            option.textContent = `Dr. ${doctor.name} (${doctor.specialty})`;
            option.setAttribute('data-doctor-id', doctor._id); // Store doctor ID
            doctorSelect.appendChild(option);
        });
    }
}

// --- Report Image Modal Functions ---
function openReportImageModal(imageUrl) {
    if (reportImageModal && reportImageDisplay) {
        reportImageDisplay.src = imageUrl;
        reportImageModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeReportImageModal() {
    if (reportImageModal) {
        reportImageModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow background scrolling
        if (reportImageDisplay) reportImageDisplay.src = ''; // Clear image source
    }
}

// --- Authentication Logic ---
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                currentPatient = data.patient;
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentLoggedInPatientEmail', email);
                console.log('Patient login successful:', currentPatient);
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

if (registerFormElement) {
    registerFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const phoneInput = document.getElementById('registerPhone');
        const dobInput = document.getElementById('registerDOB');
        const genderSelect = document.getElementById('registerGender');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const phone = phoneInput ? phoneInput.value : '';
        const dob = dobInput ? dobInput.value : '';
        const gender = genderSelect ? genderSelect.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, dob, gender, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! Please log in.');
                if (loginFormElement) loginFormElement.classList.add('active');
                if (registerFormElement) registerFormElement.classList.remove('active');
                if (registerFormElement) registerFormElement.reset();
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        currentPatient = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentLoggedInPatientEmail');
        showAuth();
        if (loginFormElement) loginFormElement.reset();
        if (registerFormElement) registerFormElement.reset();
        if (searchInput) searchInput.value = '';
        if (patientPhotoElement) patientPhotoElement.src = 'https://placehold.co/100x100/e0e7ff/0275f7?text=PT'; // Reset photo
    });
}

// --- Dashboard Data Fetching and Rendering ---
async function initializeDashboardContent() {
    if (!currentPatient || !currentPatient._id) {
        console.error("No current patient or patient ID available for dashboard data.");
        showAuth();
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn("No auth token found for dashboard data. Please log in.");
        showAuth();
        return;
    }

    let appointments = [];
    let reports = [];

    try {
        // Fetch Patient's Appointments
        const appointmentsResponse = await fetch(`${BASE_URL}/api/patients/appointments/${currentPatient._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsResponse.ok && Array.isArray(appointmentsData)) {
            appointments = appointmentsData;
            renderAppointments(appointments);
        } else {
            console.error('Failed to fetch appointments or received non-array data:', appointmentsData);
            renderAppointments([]);
        }

        // Fetch Patient's Reports
        const reportsResponse = await fetch(`${BASE_URL}/api/patients/reports/${currentPatient._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reportsData = await reportsResponse.json();
        if (reportsResponse.ok && Array.isArray(reportsData)) {
            reports = reportsData;
            renderReports(reports);
        } else {
            console.error('Failed to fetch reports or received non-array data:', reportsData);
            renderReports([]);
        }

        setupSearch(appointments, reports);
        setupTabs();
        updateStats(appointments, reports);

    } catch (error) {
        console.error('Error initializing dashboard content:', error);
        alert('Failed to load dashboard data. Please try refreshing or logging in again.');
    }
}

function renderAppointments(appointments) {
    if (!appointmentsList || !appointmentsCount) return;

    appointmentsCount.textContent = `${appointments.length} appointments`;

    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p class="no-data-message">No appointments found. Click "Book New Appointment" to schedule one.</p>';
        return;
    }

    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="card">
            <div class="appointment-header">
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

            <div class="doctor-info-appt">
                <div class="doctor-detail">
                    <i class="fas fa-user-md"></i>
                    <div>
                        <span class="label">Doctor:</span>
                        <div class="value">${appointment.doctorName || 'N/A'}</div>
                    </div>
                </div>
                <div class="doctor-detail">
                    <i class="fas fa-hospital"></i>
                    <div>
                        <span class="label">Location:</span>
                        <div class="value">${appointment.location || 'N/A'}</div>
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
                    <i class="fas fa-calendar-check"></i>
                    Reschedule
                </button>
                <button class="action-button">
                    <i class="fas fa-times"></i>
                    Cancel
                </button>
            </div>
        </div>
    `).join('');
}

function renderReports(reports) {
    if (!reportsList || !reportsCount) return;

    reportsCount.textContent = `${reports.length} reports`;

    if (reports.length === 0) {
        reportsList.innerHTML = '<p class="no-data-message">No reports found for you. Click "Add New Report" to create one.</p>';
        return;
    }

    reportsList.innerHTML = reports.map(report => `
        <div class="card">
            <div class="report-header">
                <div class="report-title-section">
                    <div class="report-icon">${getReportIcon(report.type)}</div>
                    <div>
                        <div class="report-title">${report.title || 'N/A'}</div>
                        <div class="report-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(report.date || report.lastVisit)}</span>
                        </div>
                    </div>
                </div>
                <span class="report-type-badge ${report.type?.toLowerCase().replace(/\s/g, '') || ''}">${report.type || 'N/A'}</span>
            </div>

            <div class="report-doctor-info">
                <i class="fas fa-user-md"></i>
                <span>Doctor: ${report.doctor || 'N/A'}</span>
            </div>

            <div class="report-summary">
                <p><strong>Summary:</strong> ${report.summary || 'No summary available.'}</p>
                <p><strong>Next Action:</strong> ${report.nextAction || 'N/A'}</p>
            </div>

            <div class="report-footer">
                <span class="final-badge">✓ ${report.status || 'N/A'}</span>
                <div class="report-actions">
                    <button class="action-button view" data-image-url="${report.imageUrl || 'https://placehold.co/600x400/cccccc/333333?text=No+Image+Available'}">
                        <i class="fas fa-eye"></i>
                        View Image
                    </button>
                    <button class="action-button download">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach event listeners for "View Image" buttons using event delegation
    reportsList.querySelectorAll('.action-button.view').forEach(button => {
        button.addEventListener('click', (e) => {
            const imageUrl = e.currentTarget.getAttribute('data-image-url');
            openReportImageModal(imageUrl);
        });
    });
}

function setupSearch(appointments, reports) {
    const searchInput = document.getElementById('searchInput');
    const originalAppointments = [...appointments];
    const originalReports = [...reports];

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activeTab = document.querySelector('.tab-panel.active');

        if (activeTab.id === 'appointments-tab') {
            const filteredAppointments = originalAppointments.filter(appointment =>
                (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm)) ||
                (appointment.condition && appointment.condition.toLowerCase().includes(searchTerm)) ||
                (appointment.type && appointment.type.toLowerCase().includes(searchTerm)) ||
                (appointment.location && appointment.location.toLowerCase().includes(searchTerm))
            );
            renderAppointments(filteredAppointments);
        } else if (activeTab.id === 'reports-tab') {
            const filteredReports = originalReports.filter(report =>
                (report.doctor && report.doctor.toLowerCase().includes(searchTerm)) ||
                (report.title && report.title.toLowerCase().includes(searchTerm)) ||
                (report.summary && report.summary.toLowerCase().includes(searchTerm)) ||
                (report.nextAction && report.nextAction.toLowerCase().includes(searchTerm)) ||
                (report.type && report.type.toLowerCase().includes(searchTerm))
            );
            renderReports(filteredReports);
        }
    });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.removeEventListener('click', handleTabClick); // Prevent duplicate listeners
        button.addEventListener('click', handleTabClick);
    });

    const activeTab = document.querySelector('.tab-button.active');
    if (!activeTab && tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

function handleTabClick() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const targetTab = this.getAttribute('data-tab');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    this.classList.add('active');
    const targetPanel = document.getElementById(targetTab);
    if (targetPanel) targetPanel.classList.add('active');

    if (searchInput && searchInput.value.trim() !== '') {
        searchInput.dispatchEvent(new Event('input'));
    }
}

function updateStats(appointments, reports) {
    if (upcomingAppointmentsElement) {
        const now = new Date();
        const upcoming = appointments.filter(apt => {
            const apptDate = new Date(apt.date + 'T' + apt.time);
            return apptDate > now && apt.status !== 'completed' && apt.status !== 'cancelled';
        }).length;
        upcomingAppointmentsElement.textContent = upcoming;
    }
    if (totalReportsElement) {
        totalReportsElement.textContent = reports.length;
    }
    if (lastVisitDateElement) {
        if (appointments.length > 0) {
            // Sort appointments by date descending to find the most recent
            const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
            lastVisitDateElement.textContent = formatDate(sortedAppointments[0].date);
        } else {
            lastVisitDateElement.textContent = 'N/A';
        }
    }
    if (nextAppointmentDateElement) {
        const now = new Date();
        const futureAppointments = appointments.filter(apt => {
            const apptDate = new Date(apt.date + 'T' + apt.time);
            return apptDate > now && apt.status !== 'completed' && apt.status !== 'cancelled';
        }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

        if (futureAppointments.length > 0) {
            nextAppointmentDateElement.textContent = formatDate(futureAppointments[0].date);
        } else {
            nextAppointmentDateElement.textContent = 'N/A';
        }
    }
}

// --- Booking Form Submission ---
async function handleBookingFormSubmit(e) {
    e.preventDefault();

    if (validateCurrentStep()) {
        const formData = new FormData(bookingFormElement);
        const selectedDoctorId = doctorSelect.options[doctorSelect.selectedIndex].getAttribute('data-doctor-id');

        const bookingData = {
            patientId: currentPatient._id, // Use actual patient ID
            patientName: currentPatient.name,
            patientEmail: currentPatient.email,
            patientPhone: currentPatient.phone,
            service: formData.get('service'),
            doctorId: selectedDoctorId, // Send doctor's actual ID
            doctorName: formData.get('doctor'), // Send doctor's name for display
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            notes: formData.get('notes'),
            status: 'pending', // Default status for new appointments
            type: 'consultation', // Default type, can be made selectable
            duration: '30 min' // Default duration, can be made selectable
        };

        try {
            const response = await fetch(`${BASE_URL}/api/patients/book-appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Appointment booked successfully! You can view it in your appointments tab.');
                closeBookingModal();
                await initializeDashboardContent(); // Refresh dashboard data
            } else {
                alert(`Appointment booking failed: ${result.message || 'An error occurred.'}`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred during booking. Please check your connection.');
        }
    }
}


// --- Initial App Load & Authentication Check ---
function checkAuth() {
    const loggedInEmail = localStorage.getItem('currentLoggedInPatientEmail');
    const authToken = localStorage.getItem('authToken');

    if (loggedInEmail && authToken) {
        fetch(`${BASE_URL}/api/patients/profile?email=${loggedInEmail}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Authentication failed or profile not found');
            }
            return response.json();
        })
        .then(patientData => {
            if (patientData && patientData.email === loggedInEmail) {
                currentPatient = patientData;
                showDashboard();
            } else {
                console.error('Patient re-authentication failed or data mismatch.');
                logout();
            }
        })
        .catch(error => {
            console.error('Error during patient re-authentication:', error);
            logout(); // Clear state on network/API error
        });
    } else {
        showAuth();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setMinDate(); // Set min date for appointment booking

    // Attach event listeners for booking form navigation
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (backBtn) backBtn.addEventListener('click', previousStep);
    if (bookingFormElement) bookingFormElement.addEventListener('submit', handleBookingFormSubmit);

    // Close booking modal when clicking on overlay
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeBookingModal();
            }
        });
    }

    // Close report image modal when clicking on overlay
    if (reportImageModal) {
        reportImageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeReportImageModal();
            }
        });
    }
});

// Make functions globally accessible for HTML onclicks if needed (though event listeners are preferred)
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.openReportImageModal = openReportImageModal;
window.closeReportImageModal = closeReportImageModal;
