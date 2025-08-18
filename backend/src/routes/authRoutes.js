// backend/src/routes/authRoutes.js
const express = require('express');
// 1. Impor controller
const { login, logout, getProfile } = require('../controllers/authController');
// 2. Impor middleware
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// 3. Buat router instance
const router = express.Router();

// 4. Definisikan route untuk login (tidak perlu autentikasi)
router.post('/login', login);

// 5. Definisikan route untuk logout (bisa perlu autentikasi, opsional)
router.post('/logout', logout); // Untuk sekarang, tidak wajib

// 6. Definisikan route untuk mendapatkan profil (PERLU autentikasi)
// Gunakan middleware authenticateToken sebelum controller getProfile
router.get('/profile', authenticateToken, getProfile);

// 7. Contoh route yang hanya bisa diakses oleh admin (PERLU autentikasi DAN otorisasi)
// router.get('/admin-only', authenticateToken, authorizeRole(['admin']), (req, res) => {
//   res.status(200).json({ message: 'Hello Admin!', user: req.user });
// });

// 8. Ekspor router
module.exports = router;