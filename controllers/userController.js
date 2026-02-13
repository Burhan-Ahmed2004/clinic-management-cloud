const { readData, writeData } = require('../data/db');

// Get all users (for admin purposes, or for future role display)
const getAllUsers = (req, res) => {
    const { users } = readData();
    // Don't send passwords in real applications!
    res.json(users.map(user => ({ id: user.id, username: user.username, role: user.role })));
};

// Add a new user (e.g., by an admin)
const addUser = (req, res) => {
    const data = readData();
    const newUser = {
        id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
        username: req.body.username,
        password: req.body.password, // In real apps, hash this!
        role: req.body.role || 'receptionist' // Default role
    };
    data.users.push(newUser);
    writeData(data);
    res.status(201).json({ message: 'User added successfully', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
};

// Update a user (e.g., change role or password by admin)
const updateUser = (req, res) => {
    const data = readData();
    const userId = parseInt(req.params.id);
    const updatedUserInfo = req.body;

    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        data.users[userIndex] = { ...data.users[userIndex], ...updatedUserInfo };
        writeData(data);
        const updatedUser = data.users[userIndex];
        res.json({ message: 'User updated successfully', user: { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role } });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// Delete a user
const deleteUser = (req, res) => {
    const data = readData();
    const userId = parseInt(req.params.id);

    const initialLength = data.users.length;
    data.users = data.users.filter(u => u.id !== userId);

    if (data.users.length !== initialLength) {
        writeData(data);
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    getAllUsers,
    addUser,
    updateUser,
    deleteUser
};
