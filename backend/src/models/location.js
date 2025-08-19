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
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // created_at dan updated_at akan ditangani oleh Sequelize
  },
  {
    tableName: 'locations',
    timestamps: true,   // Aktifkan timestamps
    underscored: true,  // Gunakan snake_case (created_at, updated_at)
  }
);

module.exports = Location;