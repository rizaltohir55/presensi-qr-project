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
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'users',
    // timestamps: true, // Default
  }
);

// Kita akan mendefinisikan asosiasi di file terpisah atau di server.js setelah semua model diimpor
// untuk menghindari masalah referensi silang (circular dependencies).

module.exports = User;