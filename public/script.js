// Global variables
let currentStep = 1;
const totalSteps = 3;

// Services data
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

// Doctors data
const doctorsData = [
    {
        name: 'Dr. Raksha',
        specialty: 'Cardiology',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 127,
        image: 'Raksha.jpg.jpeg',
        education: 'Harvard Medical School',
        availability: 'Mon, Wed, Fri'
    },
    {
        name: 'Dr. Brunda S',
        specialty: 'Neurology',
        experience: '10+ Years',
        rating: 4.8,
        reviews: 269,
        image: 'Brunda.jpg.jpeg',
        education: 'Madras Medical College',
        availability: 'Tue, Thu, Sat'
    },
    {
        name: 'Dr. Aishwarya D S',
        specialty: 'Pediatrics',
        experience: '4+ Years',
        rating: 4.9,
        reviews: 156,
        image: 'Aishwarya.jpg.jpeg',
        education: 'St. Johns Medical college',
        availability: 'Mon, Tue, Thu'
    },
    {
        name: 'Dr. Sruthi N',
        specialty: 'Orthopedics',
        experience: '9+ Years',
        rating: 4.7,
        reviews: 89,
        image: 'Shruthi.jpg.jpeg',
        education: 'JSS Medical College Mysore',
        availability: 'Wed, Fri, Sat'
    },
    {
        name: 'Dr. Vijay',
        specialty: 'Surgeon',
        experience: '3+ Years',
        rating: 4.8,
        reviews: 112,
        image: 'Vijay.jpg.jpeg',
        education: 'Stanley Medical College',
        availability: 'Mon, Wed, Fri'
    },
    {
        name: 'Dr. Amaresh A M',
        specialty: 'Dermatology',
        experience: '10+ Years',
        rating: 4.9,
        reviews: 203,
        image: 'Amaresh.jpg.jpeg',
        education: 'Christian Medical College Vellore',
        availability: 'Tue, Thu, Fri'
    }
];

// Initialize the website when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeServices();
    initializeDoctors('patients'); // Initialize for the patient-facing doctor grid
    initializeDoctors('doctors'); // Initialize for the doctor-portal's doctor grid
    initializeForm();
    initializeSmoothScrolling();
    setMinDate();
    // Ensure the patient portal content is active by default on page load
    showView('patient-portal-content');
});

// Function to switch between patient and doctor portal content sections
function showView(viewId) {
    // Hide all portal content sections first
    document.querySelectorAll('.portal-content').forEach(view => {
        view.classList.remove('active-portal');
        view.style.display = 'none'; // Explicitly hide
    });
    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active-portal');
        targetView.style.display = 'block'; // Or 'flex' depending on its default styling

        // Scroll to the top of the newly activated view for better UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Close mobile menu if it was open
    closeMobileMenu();
}

// Dynamically populate the services section
function initializeServices() {
    const servicesGrid = document.getElementById('servicesGrid');

    // Clear any existing content to prevent duplication if called multiple times
    if (servicesGrid) { // Added check for element existence
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

// Dynamically populate the doctors sections based on the target view
function initializeDoctors(targetView) {
    // Determine which doctor grid to populate based on the targetView parameter
    const doctorsGrid = document.getElementById(targetView === 'patients' ? 'doctorsGrid' : 'doctorsViewGrid');

    // Clear any existing content to prevent duplication
    if (doctorsGrid) { // Added check for element existence
        doctorsGrid.innerHTML = '';

        doctorsData.forEach(doctor => {
            const doctorCard = document.createElement('div');
            doctorCard.className = 'doctor-card';

            const stars = generateStars(doctor.rating);

            // Customize the button on the doctor card based on the active view
            // Patients view: "Book Appointment" button that opens the modal
            // Doctors view: "View Profile" button (placeholder for doctor-specific action)
            const buttonHtml = targetView === 'patients' ?
                `<button class="btn btn-primary" onclick="openBookingModal()">Book Appointment</button>` :
                `<button class="btn btn-outline">View Profile</button>`; // Or other doctor-specific action

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

            doctorsGrid.appendChild(doctorCard);
        });
    }
}

// Helper function to generate star rating HTML for doctor cards
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        // Add 'filled' class for stars up to the doctor's rating
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star star filled"></i>';
        } else {
            stars += '<i class="fas fa-star star"></i>';
        }
    }
    return stars;
}

// Toggle mobile menu visibility and icon
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn i');

    if (mobileMenu && menuBtn) { // Added checks for existence
        mobileMenu.classList.toggle('active'); // Toggle 'active' class for visibility

        // Change menu icon based on its state
        if (mobileMenu.classList.contains('active')) {
            menuBtn.className = 'fas fa-times'; // Change to 'X' icon
        } else {
            menuBtn.className = 'fas fa-bars'; // Change back to hamburger icon
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBtn = document.querySelector('.mobile-menu-btn i');

    if (mobileMenu && menuBtn) { // Added checks for existence
        mobileMenu.classList.remove('active'); // Remove 'active' class to hide
        menuBtn.className = 'fas fa-bars'; // Ensure hamburger icon is displayed
    }
}

// Initialize smooth scrolling for all internal anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default jump behavior
            const targetId = this.getAttribute('href');
            // Check if the link is intended to switch the main portal view
            // In this setup, header navigation links lead to patient portal sections,
            // while hero buttons toggle between patient/doctor portals.
            const isPatientSectionLink = targetId === '#hero' || targetId === '#services' || targetId === '#doctors' || targetId === '#about' || targetId === '#contact';

            // If it's a patient section link, ensure patient portal is active, then scroll
            if (isPatientSectionLink) {
                showView('patient-portal-content'); // Always switch to patient portal
                // A small delay to allow the view switch to complete before scrolling
                setTimeout(() => {
                     const updatedTargetElement = document.querySelector(targetId);
                     if(updatedTargetElement) {
                         const headerHeight = document.querySelector('.header').offsetHeight;
                         const targetPosition = updatedTargetElement.offsetTop - headerHeight;
                         window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                     }
                }, 100); // Adjust delay as needed
            }
            // If it's not a patient section link (e.g., could be a new internal link added later not handled by showView),
            // then the `showView` function above would handle portal switching.
            // For general smooth scrolling *within the active portal*, the below logic applies if `showView` didn't already trigger it.
            else {
                const targetElement = document.querySelector(targetId);
                const currentActivePortal = document.querySelector('.portal-content.active-portal');

                if (targetElement && currentActivePortal && currentActivePortal.contains(targetElement)) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}


// Open the appointment booking modal
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) { // Added check for existence
        modal.classList.add('active'); // Show modal
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// Close the appointment booking modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) { // Added check for existence
        modal.classList.remove('active'); // Hide modal
        document.body.style.overflow = 'auto'; // Allow background scrolling
        resetForm(); // Reset form state when modal closes
    }
}

// Close modal when clicking on the overlay itself
const bookingModalElement = document.getElementById('bookingModal');
if (bookingModalElement) { // Added check for existence
    bookingModalElement.addEventListener('click', function(e) {
        if (e.target === this) { // Check if the click target is the overlay itself
            closeBookingModal();
        }
    });
}

// Initialize form submission and input validation listeners
function initializeForm() {
    const form = document.getElementById('bookingForm');
    if (form) { // Added check for existence
        form.addEventListener('submit', handleFormSubmit); // Handle form submission

        // Add input event listeners for real-time validation feedback
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', validateCurrentStep);
        });
    }
}

// Set the minimum date for the appointment date input to today
function setMinDate() {
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) { // Added check for existence
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        appointmentDateInput.setAttribute('min', today);
    }
}

// Navigate to the next step in the multi-step form
function nextStep() {
    if (validateCurrentStep()) { // Only proceed if current step is valid
        if (currentStep < totalSteps) {
            currentStep++; // Increment step
            updateStep(); // Update UI
            if (currentStep === 3) {
                updateSummary(); // Populate summary on the final step
            }
        }
    }
}

// Navigate to the previous step in the multi-step form
function previousStep() {
    if (currentStep > 1) {
        currentStep--; // Decrement step
        updateStep(); // Update UI
    }
}

// Update the visibility of form steps, progress bar, and navigation buttons
function updateStep() {
    // Hide/show form steps based on currentStep
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });

    // Update progress steps (circles)
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentStep);
    });

    // Update progress lines between steps
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.toggle('active', index + 1 < currentStep);
    });

    // Update button visibility
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (backBtn) backBtn.style.display = currentStep > 1 ? 'block' : 'none'; // Show 'Back' button from step 2
    if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none'; // Show 'Next' button until last step
    if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none'; // Show 'Submit' button on last step
}

// Validate required fields in the current form step
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return true; // If element doesn't exist, assume valid for safety

    // Select all required inputs and selects within the current active step
    const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required]');

    let isValid = true;

    requiredInputs.forEach(input => {
        if (!input.value.trim()) { // Check if input value is empty or just whitespace
            input.style.borderColor = '#ef4444'; // Highlight invalid fields
            isValid = false;
        } else {
            input.style.borderColor = '#e2e8f0'; // Reset border for valid fields
        }
    });

    if (!isValid) {
        // Display a generic alert for missing fields
        // In a production app, more specific error messages would be better
        alert('Please fill in all required fields for this step.');
    }

    return isValid;
}

// Populate the appointment summary on the final step
function updateSummary() {
    const bookingFormElement = document.getElementById('bookingForm');
    const summaryContentElement = document.getElementById('summaryContent');

    if (!bookingFormElement || !summaryContentElement) return; // Exit if elements don't exist

    const formData = new FormData(bookingFormElement); // Get form data

    // Extract values from form data
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const service = formData.get('service');
    const doctor = formData.get('doctor');
    const appointmentDate = formData.get('appointmentDate');
    const appointmentTime = formData.get('appointmentTime');

    // Generate HTML for the summary
    summaryContentElement.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Patient:</span>
            <span class="summary-value">${firstName} ${lastName}</span>
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
    `;
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

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior

    if (validateCurrentStep()) {
        // Simulate form submission success
        alert('Appointment booked successfully! We will contact you shortly to confirm.');
        closeBookingModal(); // Close modal after successful submission
    }
}

// Reset the form and its UI state
function resetForm() {
    currentStep = 1; // Reset to first step
    const bookingFormElement = document.getElementById('bookingForm');
    if (bookingFormElement) { // Added check for existence
        bookingFormElement.reset(); // Clear form fields
        updateStep(); // Update UI to reflect step 1

        // Reset border colors for all input fields
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
    }
}

// Add a scroll effect to the header for a subtle visual change
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) { // Added check for header existence
        if (window.scrollY > 100) {
            // Apply a slightly transparent background and blur when scrolled down
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            // Revert to solid white background when at the top
            header.style.background = 'white';
            header.style.backdropFilter = 'none';
        }
    }
});

// Add a fade-in animation for images when they load
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1'; // Fade in the image when loaded
        });

        // Set initial opacity to 0 and add transition for the fade-in effect
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});

// Make functions globally accessible (as they are called via onclick in HTML)
window.showView = showView;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.nextStep = nextStep;
window.previousStep = previousStep;