const { readData, writeData } = require('../data/db');

// Simple login function
const login = (req, res) => {
    const { username, password } = req.body;
    const { users } = readData();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = { id: user.id, username: user.username, role: user.role }; // Set user in session
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// Get current user from session
const getCurrentUser = (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

// Logout function
const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out', error: err });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

module.exports = {
    login,
    getCurrentUser,
    logout
};
