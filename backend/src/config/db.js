// backend/src/config/db.js
// 1. Mengimpor Sequelize dari library yang telah diinstal
const { Sequelize } = require('sequelize');
// 2. Mengimpor dotenv untuk membaca konfigurasi dari file .env
const dotenv = require('dotenv');

// 3. Memuat variabel lingkungan dari file .env
dotenv.config();

// 4. Membuat instance Sequelize untuk koneksi ke database
// Kita menggunakan konfigurasi dari file .env
const sequelize = new Sequelize(
  process.env.DB_NAME,    // Nama database
  process.env.DB_USER,    // Username database
  process.env.DB_PASSWORD,// Password database
  {
    host: process.env.DB_HOST || 'localhost', // Host database (default: localhost)
    port: process.env.DB_PORT || 5432,       // Port database (default: 5432 untuk PostgreSQL)
    dialect: 'postgres',                     // Tipe database yang digunakan
    logging: false, // Set ke console.log jika ingin melihat query SQL di terminal saat development
    // pool: { // Konfigurasi pooling koneksi (opsional, untuk performa)
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  }
);

// 5. Fungsi untuk menguji koneksi ke database
// Ini berguna untuk memastikan konfigurasi sudah benar
async function testConnection() {
  try {
    // Mencoba mengautentikasi/menghubungkan ke database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    // Jika gagal, tampilkan error
    console.error('Unable to connect to the database:', error);
  }
}

// 6. Mengekspor instance sequelize agar bisa digunakan di file lain
// 7. (Opsional) Mengekspor fungsi testConnection jika ingin dijalankan saat server start
// module.exports = { sequelize, testConnection }; // Cara 1
module.exports = sequelize; // Cara 2 (yang akan kita gunakan lebih umum)
