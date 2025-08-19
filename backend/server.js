// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./src/config/db');
const shiftRoutes = require('./src/routes/shiftRoutes');
const authRoutes = require('./src/routes/authRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const qrCodeRoutes = require('./src/routes/qrCodeRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const cors = require('cors');

// --- Impor model-model ---
const User = require('./src/models/user');
const Employee = require('./src/models/employee');
const Shift = require('./src/models/shift');
const Location = require('./src/models/location');
const QRCode = require('./src/models/qrCode');
const Attendance = require('./src/models/attendance');
// --- Akhir impor model ---

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000', // Izinkan frontend Next.js
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

// --- Definisikan asosiasi *setelah* semua model diimpor ---
// Relasi User <-> Employee (satu-satu)
User.hasOne(Employee, {
  foreignKey: 'user_id',
  as: 'employee',
});
Employee.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Relasi Employee -> Shift (banyak-satu)
Employee.belongsTo(Shift, {
  foreignKey: 'shift_id',
  as: 'shift',
});
Shift.hasMany(Employee, {
  foreignKey: 'shift_id',
  as: 'employees',
});


// Relasi Employee -> Location (banyak-satu)
Employee.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});
Location.hasMany(Employee, {
  foreignKey: 'location_id',
  as: 'employees',
});

// Relasi QRCode -> Location (banyak-satu, opsional)
QRCode.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});
Location.hasMany(QRCode, {
  foreignKey: 'location_id',
  as: 'qrCodes',
});

// Relasi QRCode -> Shift (banyak-satu, opsional)
QRCode.belongsTo(Shift, {
  foreignKey: 'shift_id',
  as: 'shift',
});
Shift.hasMany(QRCode, {
  foreignKey: 'shift_id',
  as: 'qrCodes',
});

// Relasi QRCode -> User (banyak-satu, wajib)
// QR Code dibuat oleh seorang User (admin)
QRCode.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});
User.hasMany(QRCode, {
  foreignKey: 'created_by',
  as: 'createdQRCodes',
});

// Relasi Attendance -> Employee (banyak-satu)
// Satu karyawan bisa punya banyak record presensi
Attendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  allowNull: false,
  as: 'employee',
});
Employee.hasMany(Attendance, {
  foreignKey: 'employee_id',
  as: 'attendances',
});
// --- Akhir definisi asosiasi ---

// --- Menjalankan server ---
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });