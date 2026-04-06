const API_URL = 'http://localhost:3001/students';

// DOM Elements
const studentList = document.getElementById('student-list');
const addStudentForm = document.getElementById('add-student-form');
const updateModal = document.getElementById('update-modal');
const updateStudentForm = document.getElementById('update-student-form');

// Initial Load
document.addEventListener('DOMContentLoaded', fetchStudents);

// GET /students → Get all students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        renderStudents(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        studentList.innerHTML = '<div class="error no-records">Failed to connect to the database.</div>';
    }
}

// Render student cards
function renderStudents(students) {
    studentList.innerHTML = '';
    
    if (students.length === 0) {
        studentList.innerHTML = '<div class="no-records">Directory is empty. No records found.</div>';
        return;
    }

    students.forEach((student) => {
        const card = document.createElement('div');
        card.className = 'record-card';
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-id">ID: ${student.id}</span>
            </div>
            <div class="card-name">${student.name}</div>
            <div class="card-detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                ${student.branch}
            </div>
            <div class="card-detail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${student.year}
            </div>
            <div class="card-actions">
                <button onclick="handleEditClick(${student.id})" class="btn btn-neutral">Edit</button>
                <button onclick="deleteStudent(${student.id})" class="btn btn-danger">Delete</button>
            </div>
        `;
        studentList.appendChild(card);
    });
}

// GET /students/:id → Get a specific student (Triggered when clicking Edit)
async function handleEditClick(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();
        
        if (response.ok) {
            openUpdateModal(student);
        }
    } catch (error) {
        console.error('Error fetching specific student:', error);
        showNotification('Failed to retrieve record.', 'error');
    }
}

// GET /students/:id → Get a specific student (Search functionality)
async function searchStudent(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('search-id').value;
    if (!id || parseInt(id) <= 0) {
        showNotification('Invalid ID. Please enter a positive 5-digit number.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                studentList.innerHTML = '<div class="no-records">No student found with that ID.</div>';
                showNotification('Student not found.', 'error');
            } else {
                throw new Error('Server error');
            }
            return;
        }
        const student = await response.json();
        renderStudents([student]);
        showNotification(`Found record for ID: ${id}`);
    } catch (error) {
        console.error('Error fetching specific student:', error);
        showNotification('Failed to search record.', 'error');
    }
}

// Add student (POST /students)
addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const idValue = document.getElementById('student-id').value;
    if(idValue.length !== 5) {
        showNotification('ID must be exactly 5 digits.', 'error');
        return;
    }

    const newStudent = {
        id: parseInt(idValue),
        name: document.getElementById('name').value,
        branch: document.getElementById('major').value,
        year: document.getElementById('year').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
        });

        const data = await response.json();

        if (response.ok) {
            addStudentForm.reset();
            fetchStudents();
            showNotification('New record created successfully.');
        } else {
            showNotification(`Error: ${data.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        showNotification('System Error: Cannot connect to database.', 'error');
    }
});

// Delete student (DELETE /students/:id)
async function deleteStudent(id) {
    if (!confirm(`Confirm deletion of record ID: ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchStudents();
            showNotification('Record permanently deleted.');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Deletion failed.', 'error');
    }
}

// Update Modal Functions
function openUpdateModal(student) {
    updateModal.classList.add('active');
    document.getElementById('update-id').value = student.id;
    document.getElementById('update-name').value = student.name;
    document.getElementById('update-major').value = student.branch;
    document.getElementById('update-year').value = student.year;
}

function closeUpdateModal() {
    updateModal.classList.remove('active');
}

// Close modal if clicking outside
window.onclick = function(event) {
    if (event.target == updateModal) {
        closeUpdateModal();
    }
}

// Update student (PATCH /students/:id)
updateStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('update-id').value;
    const updatedData = {
        name: document.getElementById('update-name').value,
        branch: document.getElementById('update-major').value,
        year: document.getElementById('update-year').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            closeUpdateModal();
            fetchStudents();
            showNotification('Record updated successfully.');
        } else {
            showNotification('Failed to update record.', 'error');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        showNotification('Update request failed.', 'error');
    }
});

// Modern Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        
    notification.innerHTML = `
        ${icon}
        <span style="font-size: 0.95rem; font-weight: 500">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fade-out 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
