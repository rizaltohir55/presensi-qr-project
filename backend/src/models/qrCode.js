// backend/src/models/qrCode.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QRCode = sequelize.define('QRCode',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('check_in', 'check_out', 'general'),
      allowNull: false,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    shift_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // created_at dan updated_at akan ditangani oleh Sequelize
  },
  {
    tableName: 'qr_codes',
    timestamps: true,   // Aktifkan timestamps
    underscored: true,  // Gunakan snake_case (created_at, updated_at)
  }
);

module.exports = QRCode;