// Authentication state
let currentUser = null;

// DOM elements
const authSection = document.getElementById('authSection');
const mainDashboard = document.getElementById('mainDashboard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const logoutButton = document.getElementById('logoutButton');
const patientNameElement = document.getElementById('patientName');

// Authentication event listeners
showRegisterBtn.addEventListener('click', () => {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});

showLoginBtn.addEventListener('click', () => {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would connect to backend)
    if (email && password) {
        // Simulate successful login
        currentUser = {
            name: 'Madhushree',
            email: email,
            id: 'PT-2024-001'
        };
        showDashboard();
    } else {
        alert('Please enter valid credentials');
    }
});

registerFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const dob = document.getElementById('registerDob').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate form
    if (!name || !email || !phone || !dob || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Simulate successful registration
    currentUser = {
        name: name,
        email: email,
        id: 'PT-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    };
    showDashboard();
});

logoutButton.addEventListener('click', () => {
    currentUser = null;
    showAuth();
    // Clear forms
    loginFormElement.reset();
    registerFormElement.reset();
});

function showAuth() {
    authSection.style.display = 'flex';
    mainDashboard.style.display = 'none';
}

function showDashboard() {
    authSection.style.display = 'none';
    mainDashboard.style.display = 'block';
    
    // Update patient name if user is logged in
    if (currentUser) {
        patientNameElement.textContent = currentUser.name;
    }
    
    // Initialize dashboard content
    initializeDashboard();
}

function initializeDashboard() {
    // Mock data for appointments
    const appointments = [
        {
            id: 1,
            date: "2024-06-15",
            time: "09:30 AM",
            doctor: "Dr. Raksha",
            department: "Cardiology",
            type: "Follow-up",
            status: "completed",
            diagnosis: "Hypertension monitoring",
            notes: "Blood pressure stable, continue current medication"
        },
        {
            id: 2,
            date: "2024-05-20",
            time: "02:15 PM",
            doctor: "Dr. Brunda S",
            department: "Internal Medicine", 
            type: "Consultation",
            status: "completed",
            diagnosis: "Annual health checkup",
            notes: "All vitals normal, recommended lifestyle changes"
        },
        {
            id: 3,
            date: "2024-04-10",
            time: "11:00 AM",
            doctor: "Dr. Amaresh A M",
            department: "Dermatology",
            type: "Treatment",
            status: "completed",
            diagnosis: "Skin condition treatment",
            notes: "Prescribed topical medication, follow-up in 3 months"
        },
        {
            id: 4,
            date: "2024-03-25",
            time: "03:45 PM",
            doctor: "Dr. Shruthi N",
            department: "Orthopedics",
            type: "Consultation",
            status: "completed",
            diagnosis: "Knee pain assessment",
            notes: "Recommended physical therapy and follow-up"
        }
    ];

    // Mock data for reports
    const reports = [
        {
            id: 1,
            title: "Blood Test Results",
            date: "2024-06-15",
            type: "Laboratory",
            doctor: "Dr. Raksha",
            status: "final",
            summary: "Complete blood count and lipid panel within normal ranges"
        },
        {
            id: 2,
            title: "Chest X-Ray",
            date: "2024-05-20",
            type: "Radiology",
            doctor: "Dr. Brunda S",
            status: "final",
            summary: "No abnormalities detected, clear lung fields"
        },
        {
            id: 3,
            title: "ECG Report",
            date: "2024-05-20",
            type: "Cardiology",
            doctor: "Dr. Raksha",
            status: "final",
            summary: "Normal sinus rhythm, no signs of arrhythmia"
        },
        {
            id: 4,
            title: "MRI Scan - Knee",
            date: "2024-03-25",
            type: "Radiology",
            doctor: "Dr. Shruthi N",
            status: "final",
            summary: "Mild cartilage wear, no structural damage"
        }
    ];

    // Render appointments and reports
    renderAppointments(appointments);
    renderReports(reports);
    
    // Set up search functionality
    setupSearch(appointments, reports);
    
    // Set up tab functionality
    setupTabs();
}

function renderAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    const appointmentCount = document.getElementById('appointmentCount');
    
    appointmentCount.textContent = `${appointments.length} appointments`;
    
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
                    <span class="status-badge ${appointment.status}">${appointment.status}</span>
                    <span class="type-badge ${appointment.type.toLowerCase().replace('-', '')}">${appointment.type}</span>
                </div>
            </div>
            
            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-user-md"></i>
                    <div>
                        <span class="label">${appointment.doctor}</span>
                        <div class="value">${appointment.department}</div>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-stethoscope"></i>
                    <div>
                        <span class="label">Diagnosis</span>
                        <div class="value">${appointment.diagnosis}</div>
                    </div>
                </div>
            </div>
            
            <div class="appointment-notes">
                <div class="notes-header">
                    <i class="fas fa-file-text"></i>
                    <span class="notes-title">Notes:</span>
                </div>
                <div class="notes-content">${appointment.notes}</div>
            </div>
            
            <button class="view-button">
                <i class="fas fa-eye"></i>
                View Details
            </button>
        </div>
    `).join('');
}

function renderReports(reports) {
    const reportsList = document.getElementById('reportsList');
    const reportsCount = document.getElementById('reportsCount');
    
    reportsCount.textContent = `${reports.length} reports`;
    
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
                <span class="report-type-badge ${report.type.toLowerCase()}">${report.type}</span>
            </div>
            
            <div class="report-doctor">
                <i class="fas fa-user-md"></i>
                <span>By ${report.doctor}</span>
            </div>
            
            <div class="report-summary">
                <p>${report.summary}</p>
            </div>
            
            <div class="report-footer">
                <span class="final-badge">✓ ${report.status}</span>
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
    const originalAppointments = [...appointments];
    const originalReports = [...reports];
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filteredAppointments = originalAppointments.filter(appointment =>
            appointment.doctor.toLowerCase().includes(searchTerm) ||
            appointment.department.toLowerCase().includes(searchTerm) ||
            appointment.diagnosis.toLowerCase().includes(searchTerm)
        );
        
        const filteredReports = originalReports.filter(report =>
            report.title.toLowerCase().includes(searchTerm) ||
            report.type.toLowerCase().includes(searchTerm) ||
            report.doctor.toLowerCase().includes(searchTerm)
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
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getReportIcon(type) {
    switch (type) {
        case 'Laboratory': return '🧪';
        case 'Radiology': return '📷';
        case 'Cardiology': return '❤️';
        default: return '📄';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Show authentication by default
    showAuth();
});
