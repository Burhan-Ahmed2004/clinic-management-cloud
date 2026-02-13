// Import required modules
const express = require('express');
const path = require('path');
const session = require('express-session'); // For session management
const { readData, writeData } = require('./data/db'); // Import db functions

// Import route modules
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');

// Create an Express application
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Route for the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware to check if user is authenticated and has a role
const checkAuth = (req, res, next) => {
    if (req.session.user && req.session.user.role) {
        next(); // User is authenticated, proceed
    } else {
        res.redirect('/'); // Redirect to login if not authenticated
    }
};

// Route for the dashboard page (protected)
app.get('/dashboard', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
