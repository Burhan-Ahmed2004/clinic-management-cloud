const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'patients.json'); // Main data file for patients, appointments, users

// Helper function to read data from the JSON file
const readData = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is empty, return initial structure
        return {
            users: [],
            patients: [],
            appointments: [],
            nextPatientId: 1,
            nextAppointmentId: 1
        };
    }
};

// Helper function to write data to the JSON file
const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

module.exports = {
    readData,
    writeData
};
