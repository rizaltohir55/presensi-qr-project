// backend/src/models/attendance.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// Kita tidak mengimpor model terkait di sini dulu untuk menghindari circular dependency

const Attendance = sequelize.define('Attendance',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY, // Tipe data DATEONLY untuk menyimpan tanggal tanpa waktu (YYYY-MM-DD)
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE, // Tipe data DATE untuk menyimpan timestamp lengkap
      allowNull: true, // Bisa kosong jika belum check-in
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true, // Bisa kosong jika belum check-out
    },
    // Kita gunakan DataTypes.JSON atau DataTypes.TEXT untuk menyimpan objek lokasi
    // Contoh: { latitude: -6.123456, longitude: 106.123456 }
    check_in_location: {
      type: DataTypes.JSON, // Tipe data JSON untuk menyimpan objek koordinat
      allowNull: true, // Bisa kosong
      // Jika JSON tidak didukung penuh, bisa gunakan DataTypes.TEXT dan parse/stringify manual
    },
    check_out_location: {
      type: DataTypes.JSON,
      allowNull: true, // Bisa kosong
    },
    qr_code_used: {
      type: DataTypes.TEXT, // Menyimpan teks kode QR yang digunakan
      allowNull: true, // Bisa kosong (misalnya untuk presensi manual jika diizinkan)
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'on_leave', 'holiday'), // Status kehadiran
      defaultValue: 'absent', // Default 'absent' sampai check-in
      allowNull: false,
    },
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'attendances',
    // timestamps: true, // Default
    // Menambahkan indeks unik untuk kombinasi employee_id dan date
    // Ini memastikan satu karyawan hanya memiliki satu record presensi per hari
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date'] // Gabungan field untuk indeks unik
      }
    ]
  }
);

module.exports = Attendance;