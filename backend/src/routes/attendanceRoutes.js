// backend/src/routes/attendanceRoutes.js
const express = require('express');
const {
  checkIn,
  checkOut,
  getMyAttendanceHistory,
  getAttendanceReport,
  getAttendanceById
} = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Routes untuk Karyawan ---
// Semua route karyawan memerlukan autentikasi
// Gunakan middleware authenticateToken untuk semua route di bawah ini
// Tidak perlu authorizeRole(['employee']) karena kita bisa cek employee_id di controller
// Tapi untuk kejelasan dan keamanan tambahan, kita bisa tambahkan
const employeeRoutes = express.Router();
employeeRoutes.use(authenticateToken);
// Opsional: employeeRoutes.use(authorizeRole(['employee'])); // Bisa diaktifkan jika diperlukan

// POST /api/employee/attendance/check-in - Karyawan check-in
employeeRoutes.post('/check-in', checkIn);

// POST /api/employee/attendance/check-out - Karyawan check-out
employeeRoutes.post('/check-out', checkOut);

// GET /api/employee/attendance/history - Karyawan lihat riwayat presensi
employeeRoutes.get('/history', getMyAttendanceHistory);

// Mount employee routes dengan prefix
router.use('/employee', employeeRoutes); // Prefix: /api/employee/attendance/...

// --- Routes untuk Admin ---
// Semua route admin memerlukan autentikasi DAN otorisasi admin
const adminRoutes = express.Router();
adminRoutes.use(authenticateToken);
adminRoutes.use(authorizeRole(['admin']));

// GET /api/admin/attendances - Admin lihat rekap presensi
adminRoutes.get('/', getAttendanceReport);

// GET /api/admin/attendances/:id - Admin lihat detail presensi
adminRoutes.get('/:id', getAttendanceById);

// Mount admin routes dengan prefix
router.use('/admin', adminRoutes); // Prefix: /api/admin/attendances/...

module.exports = router;