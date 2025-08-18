// backend/src/models/shift.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Shift = sequelize.define('Shift',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME, // Tipe data TIME untuk menyimpan jam:menit:detik
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, // Tipe data TEXT untuk deskripsi yang lebih panjang
      allowNull: true, // Bisa kosong
    },
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'shifts',
    // timestamps: true, // Default
  }
);

module.exports = Shift;