// backend/src/routes/employeeRoutes.js
const express = require('express');
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Middleware autentikasi & otorisasi

const router = express.Router();

// Semua endpoint employee memerlukan autentikasi
// Dan hanya admin yang boleh mengakses (CRUD)
router.use(authenticateToken); // Middleware ini akan dijalankan untuk semua route di bawah ini
router.use(authorizeRole(['admin'])); // Middleware ini juga akan dijalankan untuk semua route di bawah ini

// POST /api/admin/employees - Buat karyawan baru
router.post('/', createEmployee);

// GET /api/admin/employees - Dapatkan semua karyawan
router.get('/', getAllEmployees);

// GET /api/admin/employees/:id - Dapatkan karyawan berdasarkan ID
router.get('/:id', getEmployeeById);

// PUT /api/admin/employees/:id - Perbarui karyawan
router.put('/:id', updateEmployee);

// DELETE /api/admin/employees/:id - Hapus karyawan
router.delete('/:id', deleteEmployee);

module.exports = router;