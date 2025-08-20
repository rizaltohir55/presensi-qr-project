// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const db = require('./src/models'); // Mengimpor db object dari models/index.js
const shiftRoutes = require('./src/routes/shiftRoutes');
const authRoutes = require('./src/routes/authRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const qrCodeRoutes = require('./src/routes/qrCodeRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: '*', // Izinkan semua origin untuk pengembangan
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
  res.send('API Presensi QR Backend is running...');
});

// --- Gunakan Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin/locations', locationRoutes);
app.use('/api/admin/shifts', shiftRoutes);
app.use('/api/admin/employees', employeeRoutes);
app.use('/api/admin/qr-codes', qrCodeRoutes);
app.use('/api', attendanceRoutes); // Ini mencakup /api/employee/attendance/... dan /api/admin/attendances/...

// Asosiasi model ditangani secara otomatis oleh models/index.js

// --- Menjalankan server ---
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });