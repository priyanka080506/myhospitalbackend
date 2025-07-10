// public/js/script2.js

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
const authErrorMessage = document.getElementById('authErrorMessage'); // Added for login/register error messages

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
const addAppointmentButton = document.getElementById('addAppointmentButton'); // Button to open booking modal

// DOM elements for Booking Modal (reused from index.html)
const bookingModal = document.getElementById('bookingModal');
const bookingFormElement = document.getElementById('bookingForm');
const appointmentDateInput = document.getElementById('appointmentDate');
const appointmentTimeInput = document.getElementById('appointmentTime'); // Added as it's required for booking
const serviceSelect = document.getElementById('service');
const doctorSelect = document.getElementById('doctor');
const summaryContentElement = document.getElementById('summaryContent');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const bookingModalCloseBtn = document.getElementById('bookingModalCloseBtn'); // Close button for booking modal
const bookingErrorMessage = document.getElementById('bookingErrorMessage'); // For booking specific errors

// Report Image Modal Elements
const reportImageModal = document.getElementById('reportImageModal');
const reportImageDisplay = document.getElementById('reportImageDisplay');
const reportImageModalCloseBtn = document.getElementById('reportImageModalCloseBtn'); // Close button for report image modal

// Global variables for booking modal steps
let currentStep = 1;
const totalSteps = 3;

// Global data caches (will be fetched from backend)
let allDoctors = [];
let allServices = []; // Will be fetched if a service API is available, otherwise use mock

// Mock Data (will be replaced by fetches from your backend)
// NOTE: These are now just fallback if API fails or for initial development.
// The script will attempt to fetch real data.
const servicesData = [
    { icon: 'fas fa-heart', title: 'Cardiology', description: 'Comprehensive heart care...' },
    { icon: 'fas fa-brain', title: 'Neurology', description: 'Specialized care for brain...' },
    { icon: 'fas fa-bone', title: 'Orthopedics', description: 'Expert treatment for bone...' },
    { icon: 'fas fa-eye', title: 'Surgeon', description: 'Wide range of surgical operations...' },
    { icon: 'fas fa-baby', title: 'Pediatrics', description: 'Specialized healthcare for infants...' },
    { icon: 'fas fa-stethoscope', title: 'Dermatology', description: 'Expert skin care...' }
];

const doctorsData = [
    { name: 'Dr. Ajanya', specialty: 'Cardiology', _id: 'doc1' },
    { name: 'Dr. Brunda', specialty: 'Neurology', _id: 'doc2' },
    { name: 'Dr. Ashwin', specialty: 'Pediatrics', _id: 'doc3' },
    { name: 'Dr. Madhukumar', specialty: 'Orthopedics', _id: 'doc4' },
    { name: 'Dr. Prasanna', specialty: 'Surgeon', _id: 'doc5' },
    { name: 'Dr. Adhi', specialty: 'Dermatology', _id: 'doc6' }
];


// --- Helper Functions ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
        // Ensure date is parsed correctly, consider timezone if needed
        const date = new Date(dateString);
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

function showMessage(element, message, isError = true) {
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        element.style.display = 'block';
    }
}

function hideMessage(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

// --- UI/Modal Functions (Authentication) ---
function showAuth() {
    if (authSection) authSection.style.display = 'flex';
    if (mainDashboard) mainDashboard.style.display = 'none';
    if (loginFormElement) loginFormElement.classList.add('active'); // Default to login view
    if (registerFormElement) registerFormElement.classList.remove('active');
    hideMessage(authErrorMessage); // Clear messages when showing auth section
}

async function showDashboard() {
    if (authSection) authSection.style.display = 'none';
    if (mainDashboard) mainDashboard.style.display = 'block';

    if (currentPatient) {
        // Populate header details
        patientNameElement.textContent = currentPatient.name || 'Patient';
        patientIdDisplay.textContent = `ID: ${currentPatient._id ? currentPatient._id.substring(0, 8) + '...' : 'N/A'}`;
        patientEmail.textContent = currentPatient.email || 'N/A';
        patientPhoneDisplay.textContent = currentPatient.phone || 'N/A';
        patientDOBDisplay.textContent = `DOB: ${formatDate(currentPatient.dob) || 'N/A'}`;
        patientGenderDisplay.textContent = `Gender: ${currentPatient.gender || 'N/A'}`;
        patientPhotoElement.src = currentPatient.photo || 'https://placehold.co/100x100/e0e7ff/0275f7?text=PT';
    }

    await initializeDashboardContent();
}

// --- Photo Upload Logic ---
if (patientPhotoElement) {
    patientPhotoElement.addEventListener('click', () => {
        if (photoUploadInput) {
            photoUploadInput.click();
        }
    });
}

if (photoUploadInput) {
    photoUploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            if (patientPhotoElement) patientPhotoElement.src = e.target.result;
            
            // In a real application, you would upload this file to your backend
            // For now, let's just log and provide a placeholder alert
            alert('Profile photo updated (client-side only for now). In a real app, this would be uploaded to the server to update patient profile.');
            // Example of how you *would* send to backend (requires server-side handling for file uploads)
            // const formData = new FormData();
            // formData.append('profilePicture', file);
            // const token = localStorage.getItem('authToken');
            // try {
            //     const response = await fetch(`${BASE_URL}/api/patients/upload-photo`, {
            //         method: 'POST',
            //         headers: { 'Authorization': `Bearer ${token}` },
            //         body: formData // No Content-Type header needed for FormData
            //     });
            //     if (response.ok) {
            //         const data = await response.json();
            //         currentPatient.photo = data.photoUrl; // Update local state with server URL
            //         alert('Profile photo uploaded successfully!');
            //     } else {
            //         const errorData = await response.json();
            //         alert('Failed to upload photo: ' + (errorData.message || 'Unknown error'));
            //     }
            // } catch (uploadError) {
            //     console.error('Photo upload error:', uploadError);
            //     alert('An error occurred during photo upload.');
            // }
        };
        reader.readAsDataURL(file);
    });
}

// --- UI/Modal Functions (Booking Modal) ---
function openBookingModal() {
    if (bookingModal) {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        populateServiceDropdown();
        populateDoctorDropdown(); // This will now fetch from backend
        prefillPatientInfo(); // Prefill patient data if logged in
        updateStep(); // Reset to step 1 and update UI
        hideMessage(bookingErrorMessage); // Clear previous errors
    }
}

function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow background scrolling
        resetBookingForm(); // Reset form state when modal closes
        hideMessage(bookingErrorMessage); // Clear errors
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
        showMessage(bookingErrorMessage, 'Please fill in all required fields for this step.', true);
    } else {
        hideMessage(bookingErrorMessage);
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
    const doctorName = formData.get('doctor'); // This is the doctor's name
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
            <span class="summary-value">${doctorName}</span>
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

async function submitAppointment() {
    if (!bookingFormElement) return;

    const formData = new FormData(bookingFormElement);
    const appointmentData = {
        patientName: `${formData.get('firstName')} ${formData.get('lastName')}`,
        patientEmail: formData.get('email'),
        patientPhone: formData.get('phone'),
        patientAddress: formData.get('address') || '', // Optional
        service: formData.get('service'),
        doctorName: formData.get('doctor'),
        doctorId: doctorSelect.options[doctorSelect.selectedIndex].getAttribute('data-doctor-id'), // Get actual doctor ID
        date: formData.get('appointmentDate'),
        time: formData.get('appointmentTime'),
        notes: formData.get('notes') || '', // Optional
        status: 'Pending' // Default status for new appointments
    };

    if (!currentPatient || !currentPatient._id) {
        showMessage(bookingErrorMessage, 'Error: Patient not logged in.', true);
        return;
    }

    // Add patient ID to the data
    appointmentData.patient = currentPatient._id;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/api/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming appointments can be booked by logged-in patient
            },
            body: JSON.stringify(appointmentData),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(bookingErrorMessage, 'Appointment booked successfully!', false);
            setTimeout(() => {
                closeBookingModal();
                initializeDashboardContent(); // Refresh dashboard to show new appointment
            }, 2000);
        } else {
            showMessage(bookingErrorMessage, data.message || 'Failed to book appointment.', true);
        }
    } catch (error) {
        console.error('Appointment booking error:', error);
        showMessage(bookingErrorMessage, 'An error occurred during booking. Please try again.', true);
    }
}


function resetBookingForm() {
    currentStep = 1;
    if (bookingFormElement) {
        bookingFormElement.reset();
        updateStep();
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e2e8f0'; // Reset border styles
        });
    }
    hideMessage(bookingErrorMessage); // Clear messages
}

function prefillPatientInfo() {
    if (currentPatient) {
        // Split name into first/last if applicable, assuming `name` holds full name
        const nameParts = currentPatient.name ? currentPatient.name.split(' ') : [];
        const firstName = nameParts.length > 0 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = currentPatient.email || '';
        document.getElementById('phone').value = currentPatient.phone || '';
        document.getElementById('address').value = currentPatient.address || ''; // Populate if address exists
    }
}

async function populateServiceDropdown() {
    if (!serviceSelect) return;

    // Fetch services from backend if available, otherwise use mock data
    let services = servicesData; // Default to mock data

    // If you have an API endpoint for services, uncomment and adjust this:
    /*
    try {
        const response = await fetch(`${BASE_URL}/api/services`); // Assuming a services API
        if (response.ok) {
            allServices = await response.json();
            services = allServices;
        } else {
            console.warn('Failed to fetch services from API. Using mock data.');
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        console.warn('Using mock services data.');
    }
    */

    serviceSelect.innerHTML = '<option value="">Select a Service</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.title;
        option.textContent = service.title;
        serviceSelect.appendChild(option);
    });
}

async function populateDoctorDropdown() {
    if (!doctorSelect) return;

    try {
        const response = await fetch(`${BASE_URL}/api/doctors`); // Fetch doctors from your backend
        if (response.ok) {
            allDoctors = await response.json();
        } else {
            console.error('Failed to fetch doctors from API. Using mock data.');
            allDoctors = doctorsData; // Fallback to mock data if API fails
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        allDoctors = doctorsData; // Fallback to mock data on network error
    }

    doctorSelect.innerHTML = '<option value="">Any Doctor</option>';
    allDoctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.name;
        option.textContent = `Dr. ${doctor.name} (${doctor.specialty})`;
        option.setAttribute('data-doctor-id', doctor._id); // Store doctor ID for booking
        doctorSelect.appendChild(option);
    });
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
        hideMessage(authErrorMessage);
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
        if (registerFormElement) registerFormElement.classList.remove('active');
        if (loginFormElement) loginFormElement.classList.add('active');
        hideMessage(authErrorMessage);
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
            showMessage(authErrorMessage, 'Please enter both email and password.', true);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/patients/login`, { // Corrected endpoint for patient login
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                currentPatient = data.patient; // Patient data should be returned
                localStorage.setItem('authToken', data.token); // Store the JWT
                localStorage.setItem('currentLoggedInPatientEmail', email); // Store email for convenience (optional)
                console.log('Patient login successful:', currentPatient);
                showMessage(authErrorMessage, 'Login successful!', false);
                setTimeout(() => showDashboard(), 500); // Small delay before showing dashboard
                if (loginFormElement) loginFormElement.reset();
            } else {
                showMessage(authErrorMessage, data.message || 'Login failed. Please check your credentials.', true);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(authErrorMessage, 'An error occurred during login. Please try again later.', true);
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
            showMessage(authErrorMessage, 'Please fill in all fields.', true);
            return;
        }
        if (password !== confirmPassword) {
            showMessage(authErrorMessage, 'Passwords do not match.', true);
            return;
        }
        if (password.length < 6) {
            showMessage(authErrorMessage, 'Password must be at least 6 characters long.', true);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/patients/register`, { // Corrected endpoint for patient registration
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, dob, gender, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(authErrorMessage, 'Account created successfully! Please log in.', false);
                if (loginFormElement) loginFormElement.classList.add('active');
                if (registerFormElement) registerFormElement.classList.remove('active');
                if (registerFormElement) registerFormElement.reset();
            } else {
                showMessage(authErrorMessage, data.message || 'Registration failed. Please try again.', true);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(authErrorMessage, 'An error occurred during registration. Please try again later.', true);
        }
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        currentPatient = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentLoggedInPatientEmail'); // Clear stored email
        showAuth(); // Show auth section
        if (loginFormElement) loginFormElement.reset(); // Reset forms
        if (registerFormElement) registerFormElement.reset();
        if (searchInput) searchInput.value = ''; // Clear search
        if (patientPhotoElement) patientPhotoElement.src = 'https://placehold.co/100x100/e0e7ff/0275f7?text=PT'; // Reset photo
        hideMessage(authErrorMessage); // Clear any messages
    });
}

// --- Dashboard Data Fetching and Rendering ---
async function initializeDashboardContent() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.warn("No auth token found. Redirecting to login.");
        showAuth(); // Redirect to auth if no token
        return;
    }

    try {
        // Fetch Patient Profile first (to get patient._id if not already set)
        const profileResponse = await fetch(`${BASE_URL}/api/patients/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileResponse.ok) {
            if (profileResponse.status === 401) {
                showErrorMessage('Session expired. Please log in again.');
                localStorage.removeItem('authToken');
                setTimeout(() => showAuth(), 1000);
            } else {
                const errorData = await profileResponse.json();
                showErrorMessage(errorData.message || 'Failed to fetch patient profile.');
            }
            return; // Stop if profile fetch fails
        }
        currentPatient = await profileResponse.json();
        // Update header details from fresh profile fetch
        patientNameElement.textContent = currentPatient.name || 'Patient';
        patientIdDisplay.textContent = `ID: ${currentPatient._id ? currentPatient._id.substring(0, 8) + '...' : 'N/A'}`;
        patientEmail.textContent = currentPatient.email || 'N/A';
        patientPhoneDisplay.textContent = currentPatient.phone || 'N/A';
        patientDOBDisplay.textContent = `DOB: ${formatDate(currentPatient.dob) || 'N/A'}`;
        patientGenderDisplay.textContent = `Gender: ${currentPatient.gender || 'N/A'}`;
        patientPhotoElement.src = currentPatient.photo || 'https://placehold.co/100x100/e0e7ff/0275f7?text=PT';


        let appointments = [];
        let reports = [];

        // Fetch Patient's Appointments
        const appointmentsResponse = await fetch(`${BASE_URL}/api/appointments/patient/${currentPatient._id}`, { // Endpoint needs patient ID
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
        const reportsResponse = await fetch(`${BASE_URL}/api/patients/reports/${currentPatient._id}`, { // Endpoint needs patient ID
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
        setupTabs(); // Re-initialize tab listeners
        updateStats(appointments, reports);

    } catch (error) {
        console.error('Error initializing dashboard content:', error);
        // More specific error handling could go here
        showErrorMessage('Failed to load dashboard data. Please try refreshing or logging in again.');
        // If there's a serious error fetching data, force re-auth
        localStorage.removeItem('authToken');
        setTimeout(() => showAuth(), 1000);
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
                        <span class="time">${appointment.time || 'N/A'}</span>
                    </div>
                    <div class="appointment-duration">
                        <span>${appointment.duration || 'N/A'}</span>
                    </div>
                </div>
                <div class="appointment-badges">
                    <span class="status-badge ${appointment.status?.toLowerCase() || ''}">${appointment.status || 'N/A'}</span>
                    <span class="type-badge ${appointment.service?.toLowerCase().replace(/\s/g, '') || ''}">${appointment.service || 'N/A'}</span>
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
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <span class="label">Date:</span>
                        <div class="value">${formatDate(appointment.date)}</div>
                    </div>
                </div>
            </div>

            <div class="appointment-notes">
                <div class="notes-header">
                    <i class="fas fa-file-text"></i>
                    <span class="notes-title">Notes:</span>
                </div>
                <div class="notes-content">${appointment.notes || 'No specific notes mentioned.'}</div>
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
        reportsList.innerHTML = '<p class="no-data-message">No reports found for you.</p>';
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
                <span>Doctor: ${report.doctorName || 'N/A'}</span>
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
    // Clone original arrays to maintain state during filtering
    const originalAppointments = [...appointments];
    const originalReports = [...reports];

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activeTab = document.querySelector('.tab-panel.active');

        if (activeTab && activeTab.id === 'appointments-tab-panel') { // Adjusted ID
            const filteredAppointments = originalAppointments.filter(appointment =>
                (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm)) ||
                (appointment.service && appointment.service.toLowerCase().includes(searchTerm)) ||
                (appointment.status && appointment.status.toLowerCase().includes(searchTerm)) ||
                (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm))
            );
            renderAppointments(filteredAppointments);
        } else if (activeTab && activeTab.id === 'reports-tab-panel') { // Adjusted ID
            const filteredReports = originalReports.filter(report =>
                (report.doctorName && report.doctorName.toLowerCase().includes(searchTerm)) || // Changed to doctorName
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

    const handleTabClick = (e) => {
        const targetTabId = e.currentTarget.getAttribute('data-tab');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        e.currentTarget.classList.add('active');
        document.getElementById(targetTabId).classList.add('active');

        // Re-apply search filter if there's a search term when changing tabs
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            if (targetTabId === 'appointments-tab-panel') {
                // Re-fetch or re-filter original appointments data
                initializeDashboardContent(); // Simpler to re-fetch all data and then filter
            } else if (targetTabId === 'reports-tab-panel') {
                // Re-fetch or re-filter original reports data
                initializeDashboardContent();
            }
        }
    };

    tabButtons.forEach(button => {
        // Ensure no duplicate listeners by removing first
        button.removeEventListener('click', handleTabClick);
        button.addEventListener('click', handleTabClick);
    });

    // Set initial active tab if none is active (default to first)
    if (!document.querySelector('.tab-button.active') && tabButtons.length > 0) {
        tabButtons[0].click(); // Simulate click on the first tab
    }
}


function updateStats(appointments, reports) {
    if (upcomingAppointmentsElement) {
        const now = new Date();
        const upcoming = appointments.filter(appt => new Date(appt.date + 'T' + appt.time) > now);
        upcomingAppointmentsElement.textContent = upcoming.length;
    }
    if (totalReportsElement) {
        totalReportsElement.textContent = reports.length;
    }

    if (lastVisitDateElement) {
        const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
        const lastVisit = sortedAppointments.find(appt => new Date(appt.date + 'T' + appt.time) < new Date() && appt.status === 'Completed');
        lastVisitDateElement.textContent = lastVisit ? formatDate(lastVisit.date) : 'N/A';
    }

    if (nextAppointmentDateElement) {
        const now = new Date();
        const upcomingSorted = [...appointments].filter(appt => new Date(appt.date + 'T' + appt.time) > now)
                                                 .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        nextAppointmentDateElement.textContent = upcomingSorted.length > 0 ? formatDate(upcomingSorted[0].date) : 'N/A';
    }
}


// --- Initial Setup & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    setMinDate(); // Set min date for appointment input

    // Event listeners for booking modal buttons
    if (addAppointmentButton) addAppointmentButton.addEventListener('click', openBookingModal);
    if (bookingModalCloseBtn) bookingModalCloseBtn.addEventListener('click', closeBookingModal);
    if (backBtn) backBtn.addEventListener('click', previousStep);
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (submitBtn) submitBtn.addEventListener('click', submitAppointment);

    // Event listener for report image modal close
    if (reportImageModalCloseBtn) reportImageModalCloseBtn.addEventListener('click', closeReportImageModal);

    // Check for existing token on page load
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        // Attempt to fetch patient profile to set currentPatient and show dashboard
        // This will also validate the token
        console.log('Auth token found. Attempting to load dashboard...');
        initializeDashboardContent();
        showDashboard(); // Temporarily show dashboard, initializeDashboardContent will confirm
    } else {
        console.log('No auth token found. Showing authentication section.');
        showAuth();
    }
});

// Listener for closing modals by clicking outside (optional, but good UX)
if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });
}

if (reportImageModal) {
    reportImageModal.addEventListener('click', (e) => {
        if (e.target === reportImageModal) {
            closeReportImageModal();
        }
    });
}