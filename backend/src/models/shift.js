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
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // created_at dan updated_at akan ditangani oleh Sequelize
  },
  {
    tableName: 'shifts',
    timestamps: true,   // Aktifkan timestamps
    underscored: true,  // Gunakan snake_case (created_at, updated_at)
  }
);

module.exports = Shift;