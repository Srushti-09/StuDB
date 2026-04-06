const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Custom Logging Middleware to show API calls in terminal with high visibility
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log('-------------------------------------------');
  console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('-------------------------------------------');
  next();
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '../')));

// Root route to serve index.html explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// In-memory data store for students
let students = [
  { id: 10001, name: 'Marie Curie', branch: 'Radiology', year: '4th Year' },
  { id: 10002, name: 'Albert Einstein', branch: 'Theoretical Physics', year: '3rd Year' },
  { id: 10003, name: 'Nikola Tesla', branch: 'Electrical Engineering', year: '2nd Year' },
  { id: 10004, name: 'Ada Lovelace', branch: 'Computing Science', year: '4th Year' }
];

// GET /students → Get all students
app.get('/students', (req, res) => {
  console.log('>> Executing GET /students (Fetching all records)');
  res.status(200).json(students);
});

// GET /students/:id → Get a specific student
app.get('/students/:id', (req, res) => {
  console.log(`>> Executing GET /students/${req.params.id} (Fetching specific record)`);
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.status(200).json(student);
});

// POST /students → Add a new student
app.post('/students', (req, res) => {
  console.log('>> Executing POST /students (Adding new record)');
  const { id, name, branch, year } = req.body;
  
  if (!id || !name || !branch || !year) {
    return res.status(400).json({ message: 'ID, Name, branch, and year are required' });
  }

  const numericId = parseInt(id);
  
  if (id.toString().length !== 5) {
    return res.status(400).json({ message: 'ID must be exactly 5 digits long' });
  }

  if (students.find(s => s.id === numericId)) {
    return res.status(409).json({ message: 'Student with this ID already exists' });
  }

  const newStudent = {
    id: numericId,
    name,
    branch,
    year
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// PATCH /students/:id → Update a student's record
app.patch('/students/:id', (req, res) => {
  console.log(`>> Executing PATCH /students/${req.params.id} (Updating record)`);
  const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { name, branch, year } = req.body;
  
  if (name) students[studentIndex].name = name;
  if (branch) students[studentIndex].branch = branch;
  if (year) students[studentIndex].year = year;

  res.status(200).json(students[studentIndex]);
});

// PUT /students/:id → Update a student's record (Alternative to PATCH)
app.put('/students/:id', (req, res) => {
  console.log(`>> Executing PUT /students/${req.params.id} (Updating record)`);
  const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { name, branch, year } = req.body;
  
  if (name) students[studentIndex].name = name;
  if (branch) students[studentIndex].branch = branch;
  if (year) students[studentIndex].year = year;

  res.status(200).json(students[studentIndex]);
});

// DELETE /students/:id → Delete a student record
app.delete('/students/:id', (req, res) => {
  console.log(`>> Executing DELETE /students/${req.params.id} (Terminating record)`);
  const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
  
  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const deletedStudent = students.splice(studentIndex, 1);
  res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent[0] });
});

// Start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log('===========================================');
    console.log(`Student Records API listening at http://localhost:${port}`);
    console.log('Monitoring API calls in real-time...');
    console.log('===========================================');
  });
}

// Export the app for Vercel
module.exports = app;
