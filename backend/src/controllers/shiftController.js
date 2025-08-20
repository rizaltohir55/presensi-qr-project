// backend/src/controllers/shiftController.js
const { Shift } = require('../models');

// Fungsi untuk membuat shift baru (Create)
const createShift = async (req, res) => {
  const { name, start_time, end_time, description } = req.body;

  try {
    // 1. Validasi input dasar (bisa diperluas dengan library validasi)
    if (!name || !start_time || !end_time) {
      return res.status(400).json({ message: 'Name, start_time, and end_time are required.' });
    }

    // 2. Buat shift baru di database
    const newShift = await Shift.create({
      name,
      start_time,
      end_time,
      description
    });

    // 3. Kirim response sukses
    return res.status(201).json({
      message: 'Shift created successfully',
      shift: newShift
    });

  } catch (error) {
    console.error('Error in createShift controller:', error);

    // Tangani error validasi khusus dari Sequelize (jika ada)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    // Tangani error duplikasi (jika name unik, misalnya)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Shift with this name already exists.' });
    }

    // Tangani error lainnya
    return res.status(500).json({ message: 'Server error creating shift' });
  }
};

// Fungsi untuk mendapatkan semua shift (Read - All)
const getAllShifts = async (req, res) => {
  try {
    // 1. Ambil semua shift dari database
    // Bisa ditambahkan pagination, sorting, filtering jika diperlukan
    const shifts = await Shift.findAll({
      order: [['name', 'ASC']] // Urutkan berdasarkan nama
    });

    // 2. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'Shifts retrieved successfully',
      shifts: shifts
    });

  } catch (error) {
    console.error('Error in getAllShifts controller:', error);
    return res.status(500).json({ message: 'Server error retrieving shifts' });
  }
};

// Fungsi untuk mendapatkan shift berdasarkan ID (Read - Single)
const getShiftById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari shift berdasarkan ID
    const shift = await Shift.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // 3. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'Shift retrieved successfully',
      shift: shift
    });

  } catch (error) {
    console.error('Error in getShiftById controller:', error);

    // Tangani error jika ID tidak valid (misalnya bukan UUID / tipe tidak sesuai)
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: 'Invalid shift ID format' });
    }

    return res.status(500).json({ message: 'Server error retrieving shift' });
  }
};

// Fungsi untuk memperbarui shift (Update)
const updateShift = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { name, start_time, end_time, description } = req.body;

  try {
    // 1. Cari shift yang akan diperbarui
    const shift = await Shift.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // 3. Validasi input dasar (opsional)
    // Di versi aslinya: jika body kosong, kita biarkan (tidak memaksa error),
    // sehingga tidak mengubah perilaku asli kamu.

    // 4. Perbarui shift dengan data baru
    if (req.body && Object.keys(req.body).length > 0) {
      await shift.update({
        name: name !== undefined ? name : shift.name,
        start_time: start_time !== undefined ? start_time : shift.start_time,
        end_time: end_time !== undefined ? end_time : shift.end_time,
        description: description !== undefined ? description : shift.description
      });
    }
    // Jika tidak ada data yang dikirim, shift tetap sama (sesuai perilaku awal)

    // 5. Kirim response sukses dengan data yang diperbarui
    return res.status(200).json({
      message: 'Shift updated successfully',
      shift: shift
    });

  } catch (error) {
    console.error('Error in updateShift controller:', error);

    // Tangani error validasi
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    // Tangani error duplikasi
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Shift with this name already exists.' });
    }

    // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: 'Invalid shift ID format' });
    }

    return res.status(500).json({ message: 'Server error updating shift' });
  }
};

// Fungsi untuk menghapus shift (Delete)
const deleteShift = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari shift yang akan dihapus
    const shift = await Shift.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // 3. Hapus shift dari database
    // Catatan: Jika ada relasi dengan Employee dan constraint tidak memperbolehkan delete,
    // Sequelize akan melempar error (akan ditangani di catch).
    await shift.destroy();

    // 4. Kirim response sukses
    return res.status(200).json({
      message: 'Shift deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteShift controller:', error);

    // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ message: 'Invalid shift ID format' });
    }

    // Tangani error constraint (jika ada karyawan terkait dan constraint tidak memperbolehkan delete)
    return res.status(500).json({ message: 'Server error deleting shift' });
  }
};

// Ekspor semua fungsi controller
module.exports = {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift
};
