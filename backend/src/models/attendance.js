// backend/src/models/attendance.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_in_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    check_out_location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    qr_code_used: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent', 'on_leave', 'holiday'),
      defaultValue: 'absent',
      allowNull: false,
    },
    // created_at dan updated_at akan ditangani oleh Sequelize
  },
  {
    tableName: 'attendances',
    timestamps: true,   // Aktifkan timestamps
    underscored: true,  // Gunakan snake_case (created_at, updated_at)
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date']
      }
    ]
  }
);

module.exports = Attendance;