// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token JWT
const authenticateToken = (req, res, next) => {
  //Ambil token dari header Authorization
// Format header: "Authorization: Bearer <token>"
const authHeader = req.header('Authorization');
// 2. Periksa apakah header Authorization ada dan formatnya benar
if (!authHeader || !authHeader.startsWith('Bearer ')) {
return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
}
// 3. Ekstrak token dari header (ambil bagian setelah 'Bearer ')
const token = authHeader.split(' ')[1];
try {
// 4. Verifikasi token menggunakan secret key
// jwt.verify akan melempar error jika token tidak valid/expired
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Jika token valid, simpan informasi user dari payload ke req.user
// Ini memungkinkan controller selanjutnya mengakses informasi user yang sudah terautentikasi
req.user = decoded.user;

// 6. Lanjutkan ke middleware/route handler berikutnya
next();
} catch (error) {
// 7. Tangani error jika token tidak valid atau expired
console.error('Error verifying JWT token:', error.message);
if (error.name === 'TokenExpiredError') {
return res.status(401).json({ message: 'Token has expired.' });
} else if (error.name === 'JsonWebTokenError') {
return res.status(401).json({ message: 'Invalid token.' });
} else {
return res.status(500).json({ message: 'Server error during token verification.' });
}
}
};
// Middleware untuk otorisasi berdasarkan role (misalnya: hanya admin yang bisa mengakses)
const authorizeRole = (roles) => {
return (req, res, next) => {
// 1. Pastikan user sudah terautentikasi (req.user ada)
if (!req.user) {
return res.status(401).json({ message: 'Access denied. No user authenticated.' });
}

// 2. Periksa apakah role user termasuk dalam daftar role yang diizinkan
if (!roles.includes(req.user.role)) {
return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
}

// 3. Jika role sesuai, lanjutkan ke middleware/route handler berikutnya
next();
};
};
// Ekspor middleware
module.exports = {
authenticateToken,
authorizeRole
};