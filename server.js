    // ... (rest of your script2.js code) ...

    // --- Registration Logic (Backend Integration) ---
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('registerName');
            const emailInput = document.getElementById('registerEmail');
            const phoneInput = document.getElementById('registerPhone');
            const dobInput = document.getElementById('registerDob');
            const genderInput = document.getElementById('registerGender'); // Ensure this is present in index2.html
            const passwordInput = document.getElementById('registerPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const phone = phoneInput ? phoneInput.value : '';
            const dob = dobInput ? dobInput.value : '';
            const gender = genderInput ? genderInput.value : ''; // Get gender value
            
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
                // *** THIS IS THE CRITICAL LINE TO ENSURE IT'S CORRECT ***
                const response = await fetch(`${BASE_URL}/api/patients/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, phone, dateOfBirth: dob, gender, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Account created successfully! Please log in.');
                    if (loginForm) loginForm.classList.add('active');
                    if (registerForm) registerForm.classList.remove('active');
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
    // ... (rest of your script2.js code) ...
    