// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./src/config/db');
// backend/server.js
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
app.use('/api/admin/locations', locationRoutes);
app.use('/api/admin/shifts', shiftRoutes);
app.use('/api/admin/employees', employeeRoutes);
app.use('/api/admin/qr-codes', qrCodeRoutes);
app.use('/api', attendanceRoutes);
const corsOptions = {
  origin: 'http://localhost:3000', // Izinkan frontend Next.js
  credentials: true, // Izinkan pengiriman cookies (jika diperlukan nanti)
};
app.use(cors(corsOptions));
// --- Tambahkan baris berikut untuk mengimpor routes ---

// --- Akhir tambahan ---

// Routes
app.get('/', (req, res) => {
  res.send('API Presensi QR Backend is running...');
});

// --- Tambahkan baris berikut untuk menggunakan routes ---
app.use('/api/auth', authRoutes); // Akan digunakan nanti
// --- Akhir tambahan ---

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
// Jika ingin Shift bisa mengakses daftar karyawannya:
// Shift.hasMany(Employee, {
//   foreignKey: 'shift_id',
//   as: 'employees',
// });

// Relasi Employee -> Location (banyak-satu)
Employee.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});
// Jika ingin Location bisa mengakses daftar karyawannya:
// Location.hasMany(Employee, {
//   foreignKey: 'location_id',
//   as: 'employees',
// });

// Relasi QRCode -> Location (banyak-satu, opsional)
QRCode.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location',
});
// Jika ingin Location bisa mengakses QR Codes-nya:
// Location.hasMany(QRCode, {
//   foreignKey: 'location_id',
//   as: 'qrCodes',
// });

// Relasi QRCode -> Shift (banyak-satu, opsional)
QRCode.belongsTo(Shift, {
  foreignKey: 'shift_id',
  as: 'shift',
});
// Jika ingin Shift bisa mengakses QR Codes-nya:
// Shift.hasMany(QRCode, {
//   foreignKey: 'shift_id',
//   as: 'qrCodes',
// });

// Relasi QRCode -> User (banyak-satu, wajib)
// QR Code dibuat oleh seorang User (admin)
QRCode.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});
// Jika ingin User bisa mengakses QR Codes yang dibuatnya:
// User.hasMany(QRCode, {
//   foreignKey: 'created_by',
//   as: 'createdQRCodes',
// });

// Relasi Attendance -> Employee (banyak-satu)
// Satu karyawan bisa punya banyak record presensi
Attendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  allowNull: false,
  as: 'employee',
});
// Jika ingin Employee bisa mengakses daftar presensinya:
Employee.hasMany(Attendance, {
  foreignKey: 'employee_id',
  as: 'attendances',
});
// --- Akhir definisi asosiasi ---

// --- Modifikasi bagian menjalankan server ---
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');

    // Menyinkronkan model ke database
    // { alter: true } akan mencoba mengubah tabel yang ada
    // { force: true } akan menghapus dan buat ulang tabel (HATI-HATI!)
    return sequelize.sync({ alter: true }); // atau { force: true } untuk development awal
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or synchronize models:', err);
  });
// --- Akhir modifikasi ---