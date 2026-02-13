const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Get all patients
router.get('/', patientController.getAllPatients);

// Add a new patient
router.post('/', patientController.addPatient);

// Update a patient
router.put('/:id', patientController.updatePatient);

// Delete a patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;
