// --- Configuration ---
const BASE_URL = 'https://proud-doctors.onrender.com'; // Your Render deployment URL

// --- Global variables for index.html functionality ---
let currentStep = 1;
const totalSteps = 3;

// Services data (still hardcoded here as per your original script, will be fetched if you decide to move it to backend later)
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
        description: 'Expert treatment of skin, hair and nail conditions, including cosmetics concerns.',
        features: ['Teledermatology', 'Digital grafing', 'Comparision Imaging']
    }
];

// Doctors data (still hardcoded here as per your original script)
const doctorsData = [
    {
        name: 'Dr. Ajanya',
        specialty: 'Cardiology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 127,
        image: 'Ajanya.jpg.jpeg',
        education: 'Harvard Medical School',
        availability: 'Jayadeva Hospital - Mon, Wed, Fri'
    },
    {
        name: 'Dr. Brunda',
        specialty: 'Neurology',
        experience: '6+ Years',
        rating: 4.8,
        reviews: 269,
        image: 'brunda.jpg.jpeg',
        education: 'Madras Medical College',
        availability: 'Manipal Hospital - Tue, Thu, Sat'
    },
    {
        name: 'Dr. Ashwin',
        specialty: 'Pediatrics',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 156,
        image: 'ashwin.jpg.jpeg',
        education: 'St. Johns Medical college',
        availability: 'Suraksha Hospital - Mon, Tue, Thu'
    },
    {
        name: 'Dr. Madhukumar',
        specialty: 'Orthopedics',
        experience: '5+ Years',
        rating: 4.7,
        reviews: 89,
        image: 'madhukumar.jpg.jpeg',
        education: 'JSS Medical College Mysore',
        availability: 'A R Hospital - Wed, Fri, Sat'
    },
    {
        name: 'Dr. Prasanna',
        specialty: 'Surgeon',
        experience: '10+ Years',
        rating: 4.8,
        reviews: 112,
        image: 'prasanna.jpg.jpeg',
        education: 'Stanley Medical College',
        availability: 'Sigma Hospital - Mon, Wed, Fri'
    },
    {
        name: 'Dr. Adhi',
        specialty: 'Dermatology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 203,
        image: 'adhi.jpg.jpeg',
        education: 'Christian Medical College Vellore',
        availability: 'JSS Hospital - Tue, Thu, Fri'
    }
];

// --- DOM Elements (cached for efficiency) ---
const bookingModal = document.getElementById('bookingModal');
const bookingFormElement = document.getElementById('bookingForm');
const appointmentDateInput = document.getElementById('appointmentDate');
const serviceSelect = document.getElementById('service');
const doctorSelect = document.getElementById('doctor');
const summaryContentElement = document.getElementById('summaryContent');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuBtn = document.querySelector('.mobile-menu-btn i');
const servicesGrid = document.getElementById('servicesGrid');
const doctorsGrid = document.getElementById('doctorsGrid'); // Patient-facing doctors grid

// --- Helper Functions ---

// Helper function to generate star rating HTML for doctor cards
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star star filled"></i>';
        } else {
            stars += '<i class="fas fa-star star"></i>';
        }
    }
    return stars;
}

// Helper function to format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Set the minimum date for the appointment date input to today
function setMinDate() {
    if (appointmentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.setAttribute('min', today);
    }
}

// --- UI/Modal Functions ---

// Toggle mobile menu visibility and icon
function toggleMobileMenu() {
    if (mobileMenu && menuBtn) {
        mobileMenu.classList.toggle('active');
        menuBtn.className = mobileMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    }
}

// Close mobile menu
function closeMobileMenu() {
    if (mobileMenu && menuBtn) {
        mobileMenu.classList.remove('active');
        menuBtn.className = 'fas fa-bars';
    }
}

// Open the appointment booking modal
function openBookingModal() {
    if (bookingModal) {
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        populateServiceDropdown(); // Populate dropdowns when modal opens
        populateDoctorDropdown();
    }
}

// Close the appointment booking modal
function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Allow background scrolling
        resetForm(); // Reset form state when modal closes
    }
}

// Update the visibility of form steps, progress bar, and navigation buttons
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

// Validate required fields in the current form step
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return true;

    const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required]');

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

// Function to move to the next step
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
            if (currentStep === totalSteps) {
                updateSummary(); // Populate summary on the last step
            }
        }
    }
}

// Function to move to the previous step
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

// Populate the appointment summary on the final step
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

// Reset the form and its UI state
function resetForm() {
    currentStep = 1;
    if (bookingFormElement) {
        bookingFormElement.reset();
        updateStep();
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
    }
}

// Populate service dropdown in booking modal
function populateServiceDropdown() {
    if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Select a Service</option>'; // Clear existing options
        servicesData.forEach(service => {
            const option = document.createElement('option');
            option.value = service.title;
            option.textContent = service.title;
            serviceSelect.appendChild(option);
        });
    }
}

// Populate doctor dropdown in booking modal
function populateDoctorDropdown() {
    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">Any Doctor</option>'; // Clear existing options
        doctorsData.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.name;
            option.textContent = `Dr. ${doctor.name} (${doctor.specialty})`;
            doctorSelect.appendChild(option);
        });
    }
}

// --- Core Page Navigation (for index.html sections) ---

// Function to switch between main content sections within index.html
function showView(viewId) {
    // Hide all main content sections in index.html
    document.querySelectorAll('.portal-content').forEach(view => {
        view.classList.remove('active-portal');
        view.style.display = 'none';
    });
    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active-portal');
        targetView.style.display = 'block'; // Or 'flex' depending on its default styling
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    closeMobileMenu();
}

// Initialize smooth scrolling for all internal anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // This is for scrolling within the 'patient-portal-content' section
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// --- Dynamic Content Initializers ---

// Dynamically populate the services section
function initializeServices() {
    if (servicesGrid) {
        servicesGrid.innerHTML = '';
        servicesData.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <ul class="service-features">
                    ${service.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
            servicesGrid.appendChild(serviceCard);
        });
    }
}

// Dynamically populate the doctors sections based on the target view (for index.html)
function initializeDoctors(targetView) {
    // In index.html, we only have 'doctorsGrid' for the patient-facing view
    const doctorsContainer = doctorsGrid;

    if (doctorsContainer) {
        doctorsContainer.innerHTML = '';
        doctorsData.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';
            const stars = generateStars(doctor.rating);

            // Button will always be "Book Appointment" for the public-facing site
            const buttonHtml = `<button class="btn btn-primary" onclick="openBookingModal()">Book Appointment</button>`;

            doctorCard.innerHTML = `
                <div class="doctor-image">
                    <img src="${doctor.image}" alt="${doctor.name}">
                    <div class="doctor-rating">
                        <i class="fas fa-star star"></i>
                        <span>${doctor.rating}</span>
                    </div>
                </div>
                <div class="doctor-info">
                    <h3 class="doctor-name">${doctor.name}</h3>
                    <p class="doctor-specialty">${doctor.specialty}</p>
                    <div class="doctor-details">
                        <div class="doctor-detail">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${doctor.education}</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-award"></i>
                            <span>${doctor.experience} Experience</span>
                        </div>
                        <div class="doctor-detail">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Available: ${doctor.availability}</span>
                        </div>
                    </div>
                    <div class="doctor-reviews">
                        <div class="stars">
                            ${stars}
                        </div>
                        <span class="review-count">(${doctor.reviews} reviews)</span>
                    </div>
                    ${buttonHtml}
                </div>
            `;
            doctorsContainer.appendChild(doctorCard);
        });
    }
}

// --- Form Submission (Booking Modal) ---
async function handleFormSubmit(e) {
    e.preventDefault();

    if (validateCurrentStep()) {
        const formData = new FormData(bookingFormElement);
        const bookingData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            service: formData.get('service'),
            doctor: formData.get('doctor'),
            appointmentDate: formData.get('appointmentDate'),
                        appointmentTime: formData.get('appointmentTime'),
            notes: formData.get('notes')
        };

        // For index.html, we assume this is a public booking, not tied to a logged-in user.
        // If you need it tied to a user, that logic would be in index2.html's JS.
        // If your backend requires a user ID even for public bookings, you'd need to adjust.

        try {
            // Send booking data to your backend
            const response = await fetch(`${BASE_URL}/api/appointments/public-book`, { // Example endpoint for public booking
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Appointment booked successfully! We will contact you shortly to confirm.');
                closeBookingModal();
                // No dashboard update here, as this is index.html
            } else {
                alert(`Appointment booking failed: ${result.message || 'An error occurred.'}`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred during booking. Please check your connection.');
        }
    }
}


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', function() {
    // Initialize static content
    initializeServices();
    initializeDoctors('patients'); // Initialize for the patient-facing doctor grid

    // Set min date for appointment input
    setMinDate();

    // Attach event listeners for booking form
    if (bookingFormElement) {
        bookingFormElement.addEventListener('submit', handleFormSubmit);
        bookingFormElement.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', validateCurrentStep);
        });
    }

    // Attach event listeners for modal navigation
    if (nextBtn) nextBtn.addEventListener('click', nextStep);
    if (backBtn) backBtn.addEventListener('click', previousStep);

    // Close modal when clicking on the overlay itself
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeBookingModal();
            }
        });
    }

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'white';
                header.style.backdropFilter = 'none';
            }
        }
    });

    // Image fade-in animation
    document.querySelectorAll('img').forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });

    // Initialize smooth scrolling
    initializeSmoothScrolling();

    // Ensure the patient portal content is active by default on page load
    showView('patient-portal-content'); // This will be the default view for index.html
});

// Make globally accessible functions available
window.showView = showView;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.nextStep = nextStep;
window.previousStep = previousStep;
