// backend/src/routes/qrCodeRoutes.js
const express = require('express');
const { createQRCode, getAllQRCodes, getQRCodeById, updateQRCode, deleteQRCode, getDynamicQRCode } = require('../controllers/qrCodeController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Middleware autentikasi & otorisasi

const router = express.Router();

// Semua endpoint QR Code memerlukan autentikasi
// Dan hanya admin yang boleh mengakses (CRUD)
router.use(authenticateToken); // Middleware ini akan dijalankan untuk semua route di bawah ini
router.use(authorizeRole(['admin'])); // Middleware ini juga akan dijalankan untuk semua route di bawah ini

// POST /api/admin/qr-codes/generate - Buat QR Code baru
router.post('/generate', createQRCode);

// POST /api/admin/qr-codes/generate-new - Generate QR Code baru
router.post('/generate-new', getDynamicQRCode);

// GET /api/admin/qr-codes - Dapatkan semua QR Code
router.get('/', getAllQRCodes);

// GET /api/admin/qr-codes/:id - Dapatkan QR Code berdasarkan ID
router.get('/:id', getQRCodeById);

// PUT /api/admin/qr-codes/:id/toggle - Perbarui status QR Code (aktif/nonaktif)
// Gunakan endpoint yang deskriptif untuk toggle status
router.put('/:id/toggle', updateQRCode);

// DELETE /api/admin/qr-codes/:id - Hapus QR Code
router.delete('/:id', deleteQRCode);

module.exports = router;