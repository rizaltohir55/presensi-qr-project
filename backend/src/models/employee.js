// backend/src/models/employee.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// Impor model-model yang terkait untuk referensi tipe data UUID (opsional, untuk kejelasan)
// const User = require('./user');
// const Shift = require('./shift');
// const Location = require('./location');

const Employee = sequelize.define('Employee',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    // employee_id: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   unique: true,
    // },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Menambahkan foreign key untuk Shift
    shift_id: {
      type: DataTypes.UUID, // Tipe data UUID
      allowNull: true, // Bisa kosong/null jika karyawan tidak terikat shift tertentu
      // references: {
      //   model: 'Shift', // Nama model
      //   key: 'id'
      // },
      // onDelete: 'SET NULL', // Jika shift dihapus, set shift_id jadi NULL
      // onUpdate: 'CASCADE'   // Jika id shift berubah, update shift_id
    },
    // Menambahkan foreign key untuk Location
    location_id: {
      type: DataTypes.UUID, // Tipe data UUID
      allowNull: true, // Bisa kosong/null jika karyawan tidak terikat lokasi tertentu
      // references: {
      //   model: 'Location', // Nama model
      //   key: 'id'
      // },
      // onDelete: 'SET NULL', // Jika lokasi dihapus, set location_id jadi NULL
      // onUpdate: 'CASCADE'   // Jika id lokasi berubah, update location_id
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    // Foreign key untuk relasi dengan User
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    }
    // created_at dan updated_at ditangani oleh Sequelize timestamps
  },
  {
    tableName: 'employees',
    // timestamps: true, // Default
  }
);

module.exports = Employee;