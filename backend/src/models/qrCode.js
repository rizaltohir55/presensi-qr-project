// backend/src/models/qrCode.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// Kita tidak mengimpor model terkait di sini dulu untuk menghindari circular dependency

const QRCode = sequelize.define('QRCode',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: DataTypes.TEXT, // Menyimpan kode QR yang panjang/unik
      allowNull: false,
      unique: true, // Kode QR harus unik
    },
    type: {
      type: DataTypes.ENUM('check_in', 'check_out', 'general'), // Jenis QR Code
      allowNull: false,
    },
    valid_from: {
      type: DataTypes.DATE, // Tanggal dan waktu mulai valid
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE, // Tanggal dan waktu akhir valid
      allowNull: false,
    },
    // Kita tambahkan foreign key untuk Location (bisa NULL jika tidak terikat lokasi)
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: 'Location',
      //   key: 'id'
      // }
    },
    // Kita tambahkan foreign key untuk Shift (bisa NULL jika tidak terikat shift)
    shift_id: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: 'Shift',
      //   key: 'id'
      // }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Default aktif
      allowNull: false,
    },
    // Kita tambahkan foreign key untuk User (admin yang membuat QR)
    created_by: {
      type: DataTypes.UUID,
      allowNull: false, // Harus tahu siapa yang membuat
      // references: {
      //   model: 'User',
      //   key: 'id'
      // }
    },
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'qr_codes',
    // timestamps: true, // Default
    // Kita bisa tambahkan indexes jika diperlukan untuk performa query
    // indexes: [
    //   {
    //     fields: ['valid_from', 'valid_until'] // Untuk query berdasarkan waktu validitas
    //   },
    //   {
    //     fields: ['location_id'] // Untuk query berdasarkan lokasi
    //   },
    //   {
    //     fields: ['shift_id'] // Untuk query berdasarkan shift
    //   }
    // ]
  }
);

module.exports = QRCode;