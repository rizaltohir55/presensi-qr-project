// backend/src/routes/shiftRoutes.js
const express = require('express');
const { createShift, getAllShifts, getShiftById, updateShift, deleteShift } = require('../controllers/shiftController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Middleware autentikasi & otorisasi

const router = express.Router();

// Semua endpoint shift memerlukan autentikasi
// Dan hanya admin yang boleh mengakses (CRUD)
router.use(authenticateToken); // Middleware ini akan dijalankan untuk semua route di bawah ini
router.use(authorizeRole(['admin'])); // Middleware ini juga akan dijalankan untuk semua route di bawah ini

// POST /api/admin/shifts - Buat shift baru
router.post('/', createShift);

// GET /api/admin/shifts - Dapatkan semua shift
router.get('/', getAllShifts);

// GET /api/admin/shifts/:id - Dapatkan shift berdasarkan ID
router.get('/:id', getShiftById);

// PUT /api/admin/shifts/:id - Perbarui shift
router.put('/:id', updateShift);

// DELETE /api/admin/shifts/:id - Hapus shift
router.delete('/:id', deleteShift);

module.exports = router;