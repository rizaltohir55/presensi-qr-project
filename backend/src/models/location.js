// backend/src/models/location.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Location = sequelize.define('Location',
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
    latitude: {
      type: DataTypes.DOUBLE, // Tipe data DOUBLE untuk koordinat
      allowNull: true, // Bisa kosong jika tidak digunakan untuk validasi
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true, // Bisa kosong jika tidak digunakan untuk validasi
    },
    radius: {
      type: DataTypes.INTEGER, // Radius dalam meter untuk validasi jarak
      allowNull: true, // Bisa kosong jika tidak digunakan untuk validasi
      // validate: {
      //   min: 0 // Validasi nilai minimal 0
      // }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Bisa kosong
    },
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'locations',
    // timestamps: true, // Default
  }
);

module.exports = Location;