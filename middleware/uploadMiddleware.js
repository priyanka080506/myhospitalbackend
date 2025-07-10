// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if the 'uploads' directory exists, create if not
        const uploadDir = path.join(__dirname, '../public/uploads'); // Save to public/uploads
        require('fs').mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use a unique filename (e.g., originalname-timestamp.ext)
        cb(null, file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Filter file types to allow only images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed!'), false);
    }
};

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: fileFilter
});

module.exports = upload;