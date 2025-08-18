// backend/src/controllers/locationController.js
const Location = require('../models/location');

// Fungsi untuk membuat lokasi baru (Create)
const createLocation = async (req, res) => {
  const { name, latitude, longitude, radius, description } = req.body;

  try {
    // 1. Validasi input dasar (bisa diperluas)
    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    //Buat lokasi baru di database
const newLocation = await Location.create({
name,
latitude,
longitude,
radius,
description
});

// 3. Kirim response sukses
return res.status(201).json({
message: 'Location created successfully',
location: newLocation
});
} catch (error) {
console.error('Error in createLocation controller:', error);
// Tangani error validasi khusus dari Sequelize
if (error.name === 'SequelizeValidationError') {
return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
}
// Tangani error duplikasi (jika name unik, misalnya)
// if (error.name === 'SequelizeUniqueConstraintError') {
// return res.status(400).json({ message: 'Location with this name already exists.' });
// }
// Tangani error lainnya
return res.status(500).json({ message: 'Server error creating location' });
}
};
// Fungsi untuk mendapatkan semua lokasi (Read - All)
const getAllLocations = async (req, res) => {
try {
// 1. Ambil semua lokasi dari database
// Bisa ditambahkan pagination, sorting, filtering jika diperlukan
const locations = await Location.findAll({
order: [['name', 'ASC']] // Urutkan berdasarkan nama
});

// 2. Kirim response sukses dengan data
return res.status(200).json({
message: 'Locations retrieved successfully',
locations: locations
});
} catch (error) {
console.error('Error in getAllLocations controller:', error);
return res.status(500).json({ message: 'Server error retrieving locations' });
}
};
// Fungsi untuk mendapatkan lokasi berdasarkan ID (Read - Single)
const getLocationById = async (req, res) => {
const { id } = req.params; // Ambil ID dari parameter URL
try {
// 1. Cari lokasi berdasarkan ID
const location = await Location.findByPk(id);

// 2. Jika tidak ditemukan
if (!location) {
return res.status(404).json({ message: 'Location not found' });
}

// 3. Kirim response sukses dengan data
return res.status(200).json({
message: 'Location retrieved successfully',
location: location
});
} catch (error) {
console.error('Error in getLocationById controller:', error);
// Tangani error jika ID tidak valid
if (error.name === 'SequelizeDatabaseError') {
return res.status(400).json({ message: 'Invalid location ID format' });
}
return res.status(500).json({ message: 'Server error retrieving location' });
}
};
// Fungsi untuk memperbarui lokasi (Update)
const updateLocation = async (req, res) => {
const { id } = req.params; // Ambil ID dari parameter URL
const { name, latitude, longitude, radius, description } = req.body;
try {
// 1. Cari lokasi yang akan diperbarui
const location = await Location.findByPk(id);

// 2. Jika tidak ditemukan
if (!location) {
return res.status(404).json({ message: 'Location not found' });
}

// 3. Validasi input dasar (opsional)
// Untuk sekarang, kita izinkan update sebagian

// 4. Perbarui lokasi dengan data baru
if (Object.keys(req.body).length > 0) {
await location.update({
name: name !== undefined ? name : location.name,
latitude: latitude !== undefined ? latitude : location.latitude,
longitude: longitude !== undefined ? longitude : location.longitude,
radius: radius !== undefined ? radius : location.radius,
description: description !== undefined ? description : location.description
});
}

// 5. Kirim response sukses dengan data yang diperbarui
return res.status(200).json({
message: 'Location updated successfully',
location: location // location sudah diperbarui
});
} catch (error) {
console.error('Error in updateLocation controller:', error);
// Tangani error validasi
if (error.name === 'SequelizeValidationError') {
return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
}
// Tangani error jika ID tidak valid
if (error.name === 'SequelizeDatabaseError') {
return res.status(400).json({ message: 'Invalid location ID format' });
}
return res.status(500).json({ message: 'Server error updating location' });
}
};
// Fungsi untuk menghapus lokasi (Delete)
const deleteLocation = async (req, res) => {
const { id } = req.params; // Ambil ID dari parameter URL
try {
// 1. Cari lokasi yang akan dihapus
const location = await Location.findByPk(id);

// 2. Jika tidak ditemukan
if (!location) {
return res.status(404).json({ message: 'Location not found' });
}

// 3. Hapus lokasi dari database
// Catatan: Karena ada relasi dengan Employee dan QRCode, kita perlu mempertimbangkan
// apakah akan mengizinkan penghapusan jika sudah ada data terkait.
// Untuk sekarang, kita biarkan Sequelize menangani constraint (ON DELETE SET NULL di Employee.location_id, QRCode.location_id)
await location.destroy();

// 4. Kirim response sukses
return res.status(200).json({
message: 'Location deleted successfully'
});
} catch (error) {
console.error('Error in deleteLocation controller:', error);
// Tangani error jika ID tidak valid
if (error.name === 'SequelizeDatabaseError') {
return res.status(400).json({ message: 'Invalid location ID format' });
}
// Tangani error constraint (jika ada data terkait dan constraint tidak memperbolehkan delete)
return res.status(500).json({ message: 'Server error deleting location' });
}
};
// Ekspor semua fungsi controller
module.exports = {
createLocation,
getAllLocations,
getLocationById,
updateLocation,
deleteLocation
};