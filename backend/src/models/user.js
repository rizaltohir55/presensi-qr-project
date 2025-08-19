// backend/src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee'),
      allowNull: false,
    },
    // created_at dan updated_at akan ditangani oleh Sequelize
  },
  {
    tableName: 'users',
    timestamps: true,    // Aktifkan timestamps
    underscored: true,   // Gunakan snake_case (created_at, updated_at)
  }
);

module.exports = User;