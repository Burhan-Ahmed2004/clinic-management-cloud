const { readData, writeData } = require('../data/db');

// Get all appointments
const getAllAppointments = (req, res) => {
    const { appointments } = readData();
    res.json(appointments);
};

// Add a new appointment
const addAppointment = (req, res) => {
    const data = readData();
    const newAppointment = { ...req.body, id: data.nextAppointmentId++ };
    data.appointments.push(newAppointment);
    writeData(data);
    res.status(201).json({ message: 'Appointment added successfully', appointment: newAppointment });
};

// Update an appointment
const updateAppointment = (req, res) => {
    const data = readData();
    const appointmentId = parseInt(req.params.id);
    const updatedAppointment = req.body;

    const appointmentIndex = data.appointments.findIndex(a => a.id === appointmentId);

    if (appointmentIndex !== -1) {
        data.appointments[appointmentIndex] = { ...data.appointments[appointmentIndex], ...updatedAppointment };
        writeData(data);
        res.json({ message: 'Appointment updated successfully', appointment: data.appointments[appointmentIndex] });
    } else {
        res.status(404).json({ message: 'Appointment not found' });
    }
};

// Delete an appointment
const deleteAppointment = (req, res) => {
    const data = readData();
    const appointmentId = parseInt(req.params.id);

    const initialLength = data.appointments.length;
    data.appointments = data.appointments.filter(a => a.id !== appointmentId);

    if (data.appointments.length !== initialLength) {
        writeData(data);
        res.json({ message: 'Appointment deleted successfully' });
    } else {
        res.status(404).json({ message: 'Appointment not found' });
    }
};

module.exports = {
    getAllAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment
};
