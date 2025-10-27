// server.js
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = '3462';

// 🌍 Allowed frontend origins
const ALLOWED_ORIGINS = [
  'https://admin-dashboard-s4rw.onrender.com',
  'https://fintechloans-ke.onrender.com'
];

// 🔥 Initialize Firebase (uses Render environment variable)
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  ),
});

const db = admin.firestore();
const usersCollection = db.collection('users');

// ✅ CORS setup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ✅ Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ✅ Submit eligibility form
app.post('/submit-eligibility', async (req, res) => {
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
      purpose: req.body.purpose,
    };

    const docRef = await usersCollection.add(userData);

    console.log(`✅ New application received from: ${userData.fullName}`);
    res.json({
      success: true,
      message: 'Application submitted successfully',
      userId: docRef.id,
    });
  } catch (error) {
    console.error('❌ Error processing submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your application',
    });
  }
});

// ✅ Admin login
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid password' });
  }
});

// ✅ Fetch all users
app.get('/admin/users', async (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const snapshot = await usersCollection.orderBy('timestamp', 'desc').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Fetch single user
app.get('/admin/user/:id', async (req, res) => {
  const { password } = req.query;
  if (password !== ADMIN_PASSWORD)
    return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const doc = await usersCollection.doc(req.params.id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
