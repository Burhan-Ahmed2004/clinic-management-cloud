const { readData, writeData } = require('../data/db');

// Get all patients
const getAllPatients = (req, res) => {
    const { patients } = readData();
    res.json(patients);
};

// Add a new patient
const addPatient = (req, res) => {
    const data = readData();
    const newPatient = { ...req.body, id: data.nextPatientId++ };
    data.patients.push(newPatient);
    writeData(data);
    res.status(201).json({ message: 'Patient added successfully', patient: newPatient });
};

// Update a patient
const updatePatient = (req, res) => {
    const data = readData();
    const patientId = parseInt(req.params.id);
    const updatedPatient = req.body;

    const patientIndex = data.patients.findIndex(p => p.id === patientId);

    if (patientIndex !== -1) {
        data.patients[patientIndex] = { ...data.patients[patientIndex], ...updatedPatient };
        writeData(data);
        res.json({ message: 'Patient updated successfully', patient: data.patients[patientIndex] });
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
};

// Delete a patient
const deletePatient = (req, res) => {
    const data = readData();
    const patientId = parseInt(req.params.id);

    const initialLength = data.patients.length;
    data.patients = data.patients.filter(p => p.id !== patientId);

    if (data.patients.length !== initialLength) {
        writeData(data);
        res.json({ message: 'Patient deleted successfully' });
    } else {
        res.status(404).json({ message: 'Patient not found' });
    }
};

module.exports = {
    getAllPatients,
    addPatient,
    updatePatient,
    deletePatient
};
