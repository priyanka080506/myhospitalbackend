// scriptr.js (JavaScript for the add new report form)

// Base URL for your API (MUST MATCH YOUR BACKEND'S PORT)
const BASE_URL = 'http://localhost:5000'; // CORRECTED: Changed from 3000 to 5000 to match server.js default

document.getElementById('addReportForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const token = localStorage.getItem('jwtToken'); // Get token from local storage
    if (!token) {
        alert('You are not logged in. Please log in to add a report.');
        window.location.href = 'index2.html'; // Redirect to login
        return;
    }

    const reportTitle = document.getElementById('reportTitle').value;
    const reportType = document.getElementById('reportType').value;
    const reportDoctorName = document.getElementById('reportDoctorName').value;
    const reportDate = document.getElementById('reportDate').value;
    const reportSummary = document.getElementById('reportSummary').value;
    const reportFile = document.getElementById('reportFile').files[0]; // Get the file object
    const reportImageUrl = document.getElementById('reportImageUrl').value;

    const formData = new FormData();
    formData.append('title', reportTitle);
    formData.append('type', reportType);
    formData.append('doctorName', reportDoctorName);
    formData.append('date', reportDate);
    if (reportSummary) formData.append('summary', reportSummary);
    if (reportFile) formData.append('file', reportFile); // 'file' should match your backend's expected field name for file uploads
    if (reportImageUrl) formData.append('imageUrl', reportImageUrl);

    // Fetch patientId from localStorage (set during login in script2.js)
    const patientId = localStorage.getItem('currentPatientId');

    if (!patientId) {
        alert('Patient ID not found. Please log in again.');
        window.location.href = 'index2.html';
        return;
    }
    formData.append('patientId', patientId);


    try {
        // Ensure your backend's endpoint for adding reports is set up to handle file uploads (e.g., using multer for Node.js)
        const response = await fetch(`${BASE_URL}/api/reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // 'Content-Type': 'multipart/form-data' is NOT needed with FormData, browser sets it automatically
            },
            body: formData
        });

        if (response.ok) {
            alert('Report added successfully!');
            // Redirect back to dashboard after successful upload
            window.location.href = 'index2.html';
        } else {
            const errorData = await response.json();
            alert(`Failed to add report: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error uploading report:', error);
        alert('An error occurred while uploading the report. Please try again.');
    }
});