// backend/src/routes/locationRoutes.js
const express = require('express');
const { createLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } = require('../controllers/locationController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Middleware autentikasi & otorisasi

const router = express.Router();

// Semua endpoint location memerlukan autentikasi
// Dan hanya admin yang boleh mengakses (CRUD)
router.use(authenticateToken); // Middleware ini akan dijalankan untuk semua route di bawah ini
router.use(authorizeRole(['admin'])); // Middleware ini juga akan dijalankan untuk semua route di bawah ini

// POST /api/admin/locations - Buat lokasi baru
router.post('/', createLocation);

// GET /api/admin/locations - Dapatkan semua lokasi
router.get('/', getAllLocations);

// GET /api/admin/locations/:id - Dapatkan lokasi berdasarkan ID
router.get('/:id', getLocationById);

// PUT /api/admin/locations/:id - Perbarui lokasi
router.put('/:id', updateLocation);

// DELETE /api/admin/locations/:id - Hapus lokasi
router.delete('/:id', deleteLocation);

module.exports = router;