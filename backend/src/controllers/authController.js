// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Employee = require('../models/employee');

// Fungsi untuk Login
const login = async (req, res) => {
  // 1. Ambil username dan password dari request body
  const { username, password } = req.body;

  try {
    // 2. Validasi input dasar (opsional, bisa juga pakai middleware validasi)
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // 3. Cari user berdasarkan username di database
    // Kita gunakan `include` untuk mendapatkan data employee terkait (jika ada)
    // Ini akan memudahkan frontend untuk mengetahui nama karyawan, dll.
    const user = await User.findOne({
      where: { username: username },
      include: [{
        model: Employee,
        as: 'employee', // Alias yang sama dengan yang didefinisikan di asosiasi
        attributes: ['id', 'name', 'email', 'position', 'is_active'] // Ambil field yang relevan
      }]
    });

    // 4. Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. Bandingkan password yang dikirim dengan password_hash di database
    // Gunakan bcrypt.compare untuk membandingkan password plain text dengan hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // 6. Jika password tidak cocok
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 7. Jika username dan password benar, buat JWT token
    // Payload token biasanya berisi informasi user yang ringkas
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        // Tambahkan informasi employee jika ada
        employee: user.employee ? {
          id: user.employee.id,
          name: user.employee.name,
          email: user.employee.email,
          position: user.employee.position,
          is_active: user.employee.is_active
        } : null
      }
    };

    // Tanda tangan JWT menggunakan secret key dari .env
    // expiresIn menentukan berapa lama token valid (misal: 1h, 1d, 7d)
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }, // Token valid selama 1 hari
      (err, token) => {
        if (err) {
          console.error('Error signing JWT token:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        // 8. Kirim response sukses dengan token dan data user
        // Kita tidak mengirim password_hash dalam response
        return res.status(200).json({
          message: 'Login successful',
          token: token, // Token ini akan digunakan oleh frontend untuk request selanjutnya
          user: payload.user // Data user yang sudah disiapkan di payload
        });
      }
    );

  } catch (error) {
    // 9. Tangani error server
    console.error('Error in login controller:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Fungsi untuk Logout (placeholder, karena JWT stateless)
const logout = async (req, res) => {
  try {
    // Untuk JWT stateless, logout biasanya ditangani di frontend
    // dengan cara menghapus token dari localStorage/cookies.
    // Backend bisa melakukan blacklisting token jika diperlukan (dengan Redis, dll).
    // Untuk sekarang, kita cukup kirim pesan sukses.
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error in logout controller:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// Fungsi untuk mendapatkan profil user yang sedang login
const getProfile = async (req, res) => {
  try {
    // req.user sudah diset oleh middleware authenticateToken
    // Kita bisa langsung kirim informasi ini
    // Untuk informasi lebih detail, kita bisa query ulang database
    // Tapi untuk sekarang, data dari token sudah cukup untuk demo
    return res.status(200).json({
      message: 'Profile retrieved successfully',
      user: req.user // Data user dari token
    });
  } catch (error) {
    console.error('Error in getProfile controller:', error);
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// Ekspor fungsi-fungsi controller
module.exports = {
  login,
  logout,
  getProfile // Tambahkan ini
};