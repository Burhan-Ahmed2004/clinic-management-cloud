let allPatients = [];
let allAppointments = [];
let allUsers = [];
let currentUser = null;

// Helper to show/hide elements based on user role
const showForRole = (role, elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        if (currentUser && currentUser.role === role) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    }
};

// Function to fetch and display the current user's role
const fetchCurrentUser = async () => {
    try {
        const response = await fetch('/api/auth/currentUser');
        if (response.ok) {
            currentUser = await response.json();
            showForRole('doctor', 'usersNavLink'); // Show/hide Users tab based on role
        } else {
            // Not logged in or session expired
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        window.location.href = '/'; // Redirect to login on error
    }
};

// --- Patient Management ---

// Function to render patients
const renderPatients = (patients) => {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = ''; // Clear the list before displaying

    patients.forEach(patient => {
        const patientItem = document.createElement('div');
        patientItem.className = 'patient-item card mb-3';
        
        // Patient History Display
        let historyHtml = '';
        if (patient.history && patient.history.length > 0) {
            historyHtml = `<h6 class="mt-3">History:</h6><ul class="list-group list-group-flush">`;
            patient.history.forEach((entry, index) => {
                historyHtml += `<li class="list-group-item bg-black text-white-50">${entry.date}: ${entry.notes}</li>`;
            });
            historyHtml += `</ul>`;
        } else {
            historyHtml = `<p class="text-muted">No history available.</p>`;
        }

        patientItem.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${patient.name}</h5>
                <p class="card-text"><strong>Age:</strong> ${patient.age}</p>
                <p class="card-text"><strong>Disease:</strong> ${patient.disease}</p>
                <p class="card-text"><strong>Prescription:</strong> ${patient.prescription}</p>
                <button class="btn btn-sm btn-info mt-2 me-2" onclick="openAddHistoryModal(${patient.id})">Add History</button>
                <button class="btn btn-sm btn-warning mt-2 me-2" onclick="editPatient(${patient.id})">Edit</button>
                <button class="btn btn-sm btn-danger mt-2" onclick="deletePatient(${patient.id})">Delete</button>
            </div>
        `;
        
        patientList.appendChild(patientItem);
    });
};

// Function to fetch and display patients
const fetchPatients = async () => {
    try {
        const response = await fetch('/api/patients');
        allPatients = await response.json();
        renderPatients(allPatients);
    } catch (error) {
        console.error('Error fetching patients:', error);
    }
};

// Event listener for the search input
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPatients = allPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        (patient.disease && patient.disease.toLowerCase().includes(searchTerm)) ||
        (patient.prescription && patient.prescription.toLowerCase().includes(searchTerm))
    );
    renderPatients(filteredPatients);
});

// Event listener for the form to add a new patient
document.getElementById('addPatientForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const newPatient = {
        name: document.getElementById('patientName').value,
        age: parseInt(document.getElementById('age').value),
        disease: document.getElementById('disease').value,
        prescription: document.getElementById('prescription').value,
        history: []
    };
    
    try {
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPatient),
        });
        
        if (response.ok) {
            document.getElementById('addPatientForm').reset();
            fetchPatients();
        } else {
            console.error('Failed to add patient');
            alert('Failed to add patient.');
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        alert('An error occurred while adding patient.');
    }
});

// Function to open the edit patient modal and pre-fill the form
const editPatient = (id) => {
    const patient = allPatients.find(p => p.id === id);
    if (patient) {
        document.getElementById('editPatientId').value = patient.id;
        document.getElementById('editPatientName').value = patient.name;
        document.getElementById('editAge').value = patient.age;
        document.getElementById('editDisease').value = patient.disease;
        document.getElementById('editPrescription').value = patient.prescription;

        const editModal = new bootstrap.Modal(document.getElementById('editPatientModal'));
        editModal.show();
    }
};

// Event listener for the 'Save changes' button in the edit patient modal
document.getElementById('saveChangesBtn').addEventListener('click', async () => {
    const id = document.getElementById('editPatientId').value;
    const updatedPatient = {
        name: document.getElementById('editPatientName').value,
        age: parseInt(document.getElementById('editAge').value),
        disease: document.getElementById('editDisease').value,
        prescription: document.getElementById('editPrescription').value,
    };

    try {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPatient),
        });

        if (response.ok) {
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editPatientModal'));
            editModal.hide();
            fetchPatients();
        } else {
            console.error('Failed to update patient');
            alert('Failed to update patient.');
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        alert('An error occurred while updating patient.');
    }
});

// Function to delete a patient
const deletePatient = async (id) => {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            const response = await fetch(`/api/patients/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPatients();
            } else {
                console.error('Failed to delete patient');
                alert('Failed to delete patient.');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('An error occurred while deleting patient.');
        }
    }
};

// --- Patient History Modal ---
let currentPatientIdForHistory = null;
const openAddHistoryModal = (patientId) => {
    currentPatientIdForHistory = patientId;
    document.getElementById('historyDate').valueAsDate = new Date(); // Set default to today
    document.getElementById('historyNotes').value = '';
    const addHistoryModal = new bootstrap.Modal(document.getElementById('addHistoryModal'));
    addHistoryModal.show();
};

document.getElementById('saveHistoryBtn').addEventListener('click', async () => {
    const patientId = currentPatientIdForHistory;
    const historyDate = document.getElementById('historyDate').value;
    const historyNotes = document.getElementById('historyNotes').value;

    if (!historyDate || !historyNotes) {
        alert('Please fill in all history fields.');
        return;
    }

    try {
        // Fetch the patient to add history to
        const patientResponse = await fetch(`/api/patients`); // Fetch all patients to find the one
        const patients = await patientResponse.json();
        const patientToUpdate = patients.find(p => p.id === patientId);

        if (patientToUpdate) {
            if (!patientToUpdate.history) {
                patientToUpdate.history = [];
            }
            patientToUpdate.history.push({ date: historyDate, notes: historyNotes });

            const response = await fetch(`/api/patients/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientToUpdate),
            });

            if (response.ok) {
                const addHistoryModal = bootstrap.Modal.getInstance(document.getElementById('addHistoryModal'));
                addHistoryModal.hide();
                fetchPatients(); // Refresh patient list
            } else {
                console.error('Failed to add patient history');
                alert('Failed to add patient history.');
            }
        } else {
            alert('Patient not found for history update.');
        }
    } catch (error) {
        console.error('Error adding patient history:', error);
        alert('An error occurred while adding patient history.');
    }
});


// --- Appointment Management ---
const renderAppointments = (appointments) => {
    const appointmentList = document.getElementById('appointmentList');
    appointmentList.innerHTML = '';

    if (appointments.length === 0) {
        appointmentList.innerHTML = '<p class="text-white-50">No appointments scheduled.</p>';
        return;
    }

    appointments.forEach(app => {
        const appointmentItem = document.createElement('div');
        appointmentItem.className = 'card bg-secondary text-white mb-2';
        appointmentItem.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Patient: ${app.patientName}</h5>
                <p class="card-text">Date: ${app.date} at ${app.time}</p>
                <p class="card-text">Reason: ${app.reason}</p>
                <button class="btn btn-sm btn-warning me-2" onclick="editAppointment(${app.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${app.id})">Delete</button>
            </div>
        `;
        appointmentList.appendChild(appointmentItem);
    });
};

const fetchAppointments = async () => {
    try {
        const response = await fetch('/api/appointments');
        allAppointments = await response.json();
        renderAppointments(allAppointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
};

document.getElementById('addAppointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const newAppointment = {
        patientName: document.getElementById('appointmentPatientName').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        reason: document.getElementById('appointmentReason').value,
    };
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment),
        });
        if (response.ok) {
            document.getElementById('addAppointmentForm').reset();
            fetchAppointments();
        } else {
            alert('Failed to add appointment.');
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
        alert('An error occurred while adding appointment.');
    }
});

// Edit appointment function
const editAppointment = (id) => {
    const appointment = allAppointments.find(a => a.id === id);
    if (appointment) {
        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('appointmentPatientName').value = appointment.patientName;
        document.getElementById('appointmentDate').value = appointment.date;
        document.getElementById('appointmentTime').value = appointment.time;
        document.getElementById('appointmentReason').value = appointment.reason;

        const appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
        appointmentModal.show();
    }
};

// Event listener for the 'Save Appointment' button in the appointment modal
document.getElementById('saveAppointmentBtn').addEventListener('click', async () => {
    const id = document.getElementById('appointmentId').value;
    const updatedAppointment = {
        patientName: document.getElementById('appointmentPatientName').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        reason: document.getElementById('appointmentReason').value,
    };

    try {
        const response = await fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedAppointment),
        });

        if (response.ok) {
            const appointmentModal = bootstrap.Modal.getInstance(document.getElementById('appointmentModal'));
            appointmentModal.hide();
            fetchAppointments();
        } else {
            console.error('Failed to update appointment');
            alert('Failed to update appointment.');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
        alert('An error occurred while updating appointment.');
    }
});
const deleteAppointment = async (id) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchAppointments();
            } else {
                alert('Failed to delete appointment.');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('An error occurred while deleting appointment.');
        }
    }
};


// --- User Management ---
const renderUsers = (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = '<p class="text-white-50">No users available.</p>';
        return;
    }

    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'card bg-info text-white mb-2';
        userItem.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Username: ${user.username}</h5>
                <p class="card-text">Role: ${user.role}</p>
                <button class="btn btn-sm btn-warning me-2" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </div>
        `;
        userList.appendChild(userItem);
    });
};

const fetchUsers = async () => {
    try {
        const response = await fetch('/api/users');
        allUsers = await response.json();
        renderUsers(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

document.getElementById('addUserForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const newUser = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newUserRole').value,
    };
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        if (response.ok) {
            document.getElementById('addUserForm').reset();
            fetchUsers();
        } else {
            alert('Failed to add user.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('An error occurred while adding user.');
    }
});

// Edit user function
const editUser = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (user) {
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('password').value = ''; // Clear password for security
        document.getElementById('userRole').value = user.role;

        const userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    }
};

// Event listener for the 'Save User' button in the user modal
document.getElementById('saveUserBtn').addEventListener('click', async () => {
    const id = document.getElementById('userId').value;
    const updatedUser = {
        username: document.getElementById('username').value,
        role: document.getElementById('userRole').value,
    };
    // Only update password if provided
    const password = document.getElementById('password').value;
    if (password) {
        updatedUser.password = password;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            userModal.hide();
            fetchUsers();
        } else {
            console.error('Failed to update user');
            alert('Failed to update user.');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating user.');
    }
});
const deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting user.');
        }
    }
};


// --- Analytics ---
const renderAnalytics = async () => {
    const analyticsContent = document.getElementById('analyticsContent');

    // Ensure data is up-to-date before rendering analytics
    await fetchPatients();
    await fetchAppointments();
    await fetchUsers();

    analyticsContent.innerHTML = `
        <p>Total Patients: ${allPatients.length}</p>
        <p>Total Appointments: ${allAppointments.length}</p>
        <p>Total Users: ${allUsers.length}</p>
        <p class="text-white-50">More advanced analytics (charts, trends) would go here.</p>
    `;
};


// --- Initial Load & Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser(); // Fetch user info first

    // Initial data fetches based on selected tab
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const targetId = activeTab.getAttribute('href').substring(1);
        if (targetId === 'patients') {
            fetchPatients();
        } else if (targetId === 'appointments') {
            fetchAppointments();
        } else if (targetId === 'users') {
            fetchUsers();
        } else if (targetId === 'analytics') {
            renderAnalytics();
        }
    }

    // Event listener for tab clicks
    document.querySelectorAll('.nav-link').forEach(tab => {
        tab.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href').substring(1);
            // Hide all tab content
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
            // Show active tab content
            document.getElementById(targetId).classList.add('show', 'active');

            // Fetch data for the newly active tab
            if (targetId === 'patients') {
                fetchPatients();
            } else if (targetId === 'appointments') {
                fetchAppointments();
            } else if (targetId === 'users') {
                fetchUsers();
            } else if (targetId === 'analytics') {
                renderAnalytics();
            }
        });
    });

    // Logout button event listener
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Failed to logout.');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            alert('An error occurred during logout.');
        }
    });
});
