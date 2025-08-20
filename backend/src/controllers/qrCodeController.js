// backend/src/controllers/qrCodeController.js
const { QRCode, Location, Shift } = require('../models');
const { v4: uuidv4 } = require('uuid'); // Untuk membuat kode QR unik
const { generateShortCode } = require('../utils/codeGenerator'); // Import short code generator
const QRCodeGenerator = require('qrcode');
const crypto = require('crypto');
const { generateToken } = require('../utils/qrTokenGenerator');

// Fungsi untuk membuat QR Code baru (Create)
const createQRCode = async (req, res) => {
  // Ambil data dari request body dan user dari middleware auth
  const { type, valid_from, valid_until, location_id, shift_id } = req.body;
  const creator_id = req.user.id; // ID admin yang membuat QR Code (dari token)

  try {
    // 1. Validasi input dasar
    if (!type || !valid_from || !valid_until) {
      return res.status(400).json({ message: 'Type, valid_from, and valid_until are required.' });
    }

    // 2. Validasi tanggal: valid_until harus setelah valid_from
    const fromDate = new Date(valid_from);
    const untilDate = new Date(valid_until);
    if (untilDate <= fromDate) {
      return res.status(400).json({ message: 'valid_until must be after valid_from.' });
    }

    // 3. Buat kode QR unik
    // Bisa berupa UUID, atau string acak lainnya
    const uniqueCode = `QR-${generateShortCode(6)}`;

    // 4. Buat QR Code baru di database
    const newQRCode = await QRCode.create({
      code: uniqueCode,
      type: type,
      valid_from: valid_from,
      valid_until: valid_until,
      location_id: location_id, // Bisa null
      shift_id: shift_id, // Bisa null
      is_active: true, // Default aktif saat dibuat
      created_by: creator_id // ID admin yang membuat
    });

    // 5. Kirim response sukses dengan kode QR yang dihasilkan
    // Kita tidak perlu mengirim created_by untuk frontend dalam hal ini
    const { created_by, ...qrCodeToSend } = newQRCode.get(); // Hilangkan created_by dari response
    return res.status(201).json({
      message: 'QR Code generated successfully',
      qrCode: qrCodeToSend,
      uniqueCode: newQRCode.code // Add the unique short code to the response
    });

  } catch (error) {
    console.error('Error in createQRCode controller:', error);
    // Tangani error validasi khusus dari Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    // Tangani error jika location_id atau shift_id tidak valid (foreign key constraint)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Invalid location_id or shift_id provided.' });
    }
    // Tangani error lainnya
    return res.status(500).json({ message: 'Server error generating QR Code' });
  }
};

// Fungsi untuk mendapatkan semua QR Code (Read - All)
const getAllQRCodes = async (req, res) => {
  try {
    // 1. Ambil semua QR Code dari database
    // Bisa ditambahkan pagination, sorting, filtering, dan eager loading relasi
    const qrCodes = await QRCode.findAll({
      include: [
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name'] // Hanya ambil field tertentu dari Location
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name'] // Hanya ambil field tertentu dari Shift
        }
      ],
      order: [['created_at', 'DESC']] // Urutkan berdasarkan waktu pembuatan, terbaru dulu
    });

    // 2. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'QR Codes retrieved successfully',
      qrCodes: qrCodes
    });

  } catch (error) {
    console.error('Error in getAllQRCodes controller:', error);
    return res.status(500).json({ message: 'Server error retrieving QR Codes' });
  }
};

// Fungsi untuk mendapatkan QR Code berdasarkan ID (Read - Single)
const getQRCodeById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari QR Code berdasarkan ID
    const qrCode = await QRCode.findByPk(id, {
      include: [
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name']
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name']
        }
      ]
    });

    // 2. Jika tidak ditemukan
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // 3. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'QR Code retrieved successfully',
      qrCode: qrCode
    });

  } catch (error) {
    console.error('Error in getQRCodeById controller:', error);
    // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
         return res.status(400).json({ message: 'Invalid QR Code ID format' });
    }
    return res.status(500).json({ message: 'Server error retrieving QR Code' });
  }
};

// Fungsi untuk memperbarui QR Code (Update)
// Biasanya hanya memperbarui status aktif/nonaktif
const updateQRCode = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { is_active } = req.body; // Hanya izinkan update is_active

  try {
    // 1. Cari QR Code yang akan diperbarui
    const qrCode = await QRCode.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // 3. Validasi input (harus ada is_active)
    if (is_active === undefined) {
         return res.status(400).json({ message: 'is_active field is required for update.' });
    }

    // 4. Perbarui QR Code dengan data baru
    await qrCode.update({
       is_active: is_active
    });

    // 5. Kirim response sukses dengan data yang diperbarui
    return res.status(200).json({
      message: 'QR Code updated successfully',
      qrCode: qrCode // qrCode sudah diperbarui
    });

  } catch (error) {
    console.error('Error in updateQRCode controller:', error);
    // Tangani error validasi
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
     // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
         return res.status(400).json({ message: 'Invalid QR Code ID format' });
    }
    return res.status(500).json({ message: 'Server error updating QR Code' });
  }
};

// Fungsi untuk menghapus QR Code (Delete)
const deleteQRCode = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari QR Code yang akan dihapus
    const qrCode = await QRCode.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // 3. Hapus QR Code dari database
    await qrCode.destroy();

    //Kirim response sukses
return res.status(200).json({
message: 'QR Code deleted successfully'
});
} catch (error) {
console.error('Error in deleteQRCode controller:', error);
// Tangani error jika ID tidak valid
if (error.name === 'SequelizeDatabaseError') {
return res.status(400).json({ message: 'Invalid QR Code ID format' });
}
// Tangani error constraint (jika ada data terkait dan constraint tidak memperbolehkan delete)
// Untuk QRCode, kemungkinan besar tidak ada constraint yang mencegah delete.
return res.status(500).json({ message: 'Server error deleting QR Code' });
}
};
// Ekspor semua fungsi controller
const getDynamicQRCode = async (req, res) => {
  const { location_id, shift_id } = req.query; // Use req.query for GET requests
  const creator_id = req.user.id; // Assuming admin user is logged in and req.user.id is available

  try {
    const now = new Date();
    const valid_from = now;
    const valid_until = new Date(now.getTime() + 60 * 1000); // 1 minute from now

    // Generate a unique code for this QR instance
    const uniqueCode = `DYNAMIC-QR-${generateShortCode(6)}`;

    // Store this dynamic QR code instance in the database
    const newQRCodeInstance = await QRCode.create({
      code: uniqueCode,
      type: 'general', // Or 'general', depending on your specific needs
      valid_from: valid_from,
      valid_until: valid_until,
      location_id: location_id || null,
      shift_id: shift_id || null,
      is_active: true,
      created_by: creator_id,
    });

    // Data to be encoded in the QR code
    // Include the uniqueCode and valid_until for frontend validation
    // Generate time-based token
    const token = generateToken(location_id, shift_id);

    // Data to be encoded in the QR code
    // Include the uniqueCode, valid_until, and the generated token for frontend validation
    const qrData = JSON.stringify({
      token: token, // The time-based token
      code: uniqueCode, // The unique identifier for this QR code instance (from DB)
      valid_until: valid_until.toISOString(), // Send as ISO string for easy parsing
      location_id: location_id || null,
      shift_id: shift_id || null,
    });

    // Generate QR code image as a data URL
    const qrCodeImage = await QRCodeGenerator.toDataURL(qrData);

    return res.status(200).json({
      message: 'Dynamic QR Code generated successfully',
      qrCodeImage: qrCodeImage,
      valid_until: valid_until.toISOString(), // Send valid_until to frontend for countdown
      qrCodeId: newQRCodeInstance.id, // Optionally send the DB ID
      uniqueCode: newQRCodeInstance.code // Add the unique short code to the response
    });
  } catch (error) {
    console.error('Error in getDynamicQRCode controller:', error);
    return res.status(500).json({ message: `Server error generating dynamic QR Code: ${error.message || 'Unknown error'}` });
  }
};

module.exports = {
  createQRCode,
  getAllQRCodes,
  getQRCodeById,
  updateQRCode,
  deleteQRCode,
  getDynamicQRCode, // Export the new function
};