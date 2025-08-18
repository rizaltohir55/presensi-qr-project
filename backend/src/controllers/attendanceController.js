// backend/src/controllers/attendanceController.js
const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const QRCode = require('../models/qrCode');

// --- Endpoint untuk Karyawan: Presensi (Check-in/Check-out) ---
// Fungsi untuk check-in (oleh karyawan)
const checkIn = async (req, res) => {
  const { qr_code } = req.body; // Kode QR yang discan
  const employee_id = req.user.employee ? req.user.employee.id : null; // ID karyawan dari token
  // const { latitude, longitude } = req.body; // Opsional: lokasi saat check-in

  try {
    //Validasi input dasar
if (!qr_code) {
return res.status(400).json({ message: 'QR code is required.' });
}
if (!employee_id) {
return res.status(400).json({ message: 'Employee ID not found in token. Are you logged in as an employee?' });
}

// 2. Cari QR Code berdasarkan kode
const qrRecord = await QRCode.findOne({ where: { code: qr_code } });

// Validasi QR Code
if (!qrRecord) {
return res.status(400).json({ message: 'Invalid QR code.' });
}
if (!qrRecord.is_active) {
return res.status(400).json({ message: 'QR code is inactive.' });
}
const now = new Date();
if (now < new Date(qrRecord.valid_from) || now > new Date(qrRecord.valid_until)) {
return res.status(400).json({ message: 'QR code is not valid at this time.' });
}
// Validasi tipe QR Code (opsional, bisa ditambahkan)
if (qrRecord.type !== 'check_in' && qrRecord.type !== 'general') {
return res.status(400).json({ message: 'This QR code is not for check-in.' });
}
// Validasi lokasi (jika diperlukan dan data lokasi dikirim) bisa ditambahkan di sini

// 4. Dapatkan tanggal hari ini (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

// 5. Cek apakah karyawan sudah melakukan check-in hari ini
const existingAttendance = await Attendance.findOne({
where: {
employee_id: employee_id,
date: today
}
});

if (existingAttendance && existingAttendance.check_in_time) {
return res.status(400).json({ message: 'You have already checked in today.' });
}

// 6. Tentukan status kehadiran (misalnya, jika check-in setelah jam 8 pagi, dianggap terlambat)
// Logika ini bisa disesuaikan dengan shift karyawan jika ada
let status = 'present';
const checkInTime = new Date();
const lateThreshold = new Date();
lateThreshold.setHours(8, 0, 0, 0); // Misalnya, terlambat jika check-in setelah jam 8 pagi
if (checkInTime > lateThreshold) {
status = 'late';
}

// 7. Buat atau perbarui record presensi
let attendanceRecord;
if (existingAttendance) {
// Jika sudah ada record (misalnya untuk validasi sebelumnya), update
attendanceRecord = await existingAttendance.update({
check_in_time: checkInTime,
// check_in_location: latitude && longitude ? { latitude, longitude } : null, // Simpan lokasi jika ada
qr_code_used: qr_code,
status: status // Update status
});
} else {
// Jika belum ada, buat record baru
attendanceRecord = await Attendance.create({
employee_id: employee_id,
date: today,
check_in_time: checkInTime,
// check_in_location: latitude && longitude ? { latitude, longitude } : null,
qr_code_used: qr_code,
status: status
});
}

// 8. Kirim response sukses
return res.status(200).json({
message: 'Check-in successful',
attendance: attendanceRecord
});
} catch (error) {
console.error('Error in checkIn controller:', error);
return res.status(500).json({ message: 'Server error during check-in' });
}
};
// Fungsi untuk check-out (oleh karyawan)
const checkOut = async (req, res) => {
const { qr_code } = req.body; // Kode QR yang discan
const employee_id = req.user.employee ? req.user.employee.id : null; // ID karyawan dari token
// const { latitude, longitude } = req.body; // Opsional: lokasi saat check-out
try {
// 1. Validasi input dasar
if (!qr_code) {
return res.status(400).json({ message: 'QR code is required.' });
}
if (!employee_id) {
return res.status(400).json({ message: 'Employee ID not found in token. Are you logged in as an employee?' });
}

// 2. Cari QR Code berdasarkan kode
const qrRecord = await QRCode.findOne({ where: { code: qr_code } });

// 3. Validasi QR Code
if (!qrRecord) {
return res.status(400).json({ message: 'Invalid QR code.' });
}
if (!qrRecord.is_active) {
return res.status(400).json({ message: 'QR code is inactive.' });
}
const now = new Date();
if (now < new Date(qrRecord.valid_from) || now > new Date(qrRecord.valid_until)) {
return res.status(400).json({ message: 'QR code is not valid at this time.' });
}
// Validasi tipe QR Code (opsional)
if (qrRecord.type !== 'check_out' && qrRecord.type !== 'general') {
return res.status(400).json({ message: 'This QR code is not for check-out.' });
}

// 4. Dapatkan tanggal hari ini (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// 5. Cari record presensi hari ini untuk karyawan ini
const attendanceRecord = await Attendance.findOne({
where: {
employee_id: employee_id,
date: today
}
});

// 6. Validasi apakah sudah check-in
if (!attendanceRecord) {
return res.status(400).json({ message: 'You have not checked in today. Cannot check out.' });
}
if (!attendanceRecord.check_in_time) {
return res.status(400).json({ message: 'You have not checked in today. Cannot check out.' });
}
if (attendanceRecord.check_out_time) {
return res.status(400).json({ message: 'You have already checked out today.' });
}

// 7. Update record presensi dengan waktu check-out
const updatedAttendance = await attendanceRecord.update({
check_out_time: new Date(),
// check_out_location: latitude && longitude ? { latitude, longitude } : null
});

// 8. Kirim response sukses
return res.status(200).json({
message: 'Check-out successful',
attendance: updatedAttendance
});
} catch (error) {
console.error('Error in checkOut controller:', error);
return res.status(500).json({ message: 'Server error during check-out' });
}
};
// --- Endpoint untuk Karyawan: Riwayat Presensi Pribadi ---
// Fungsi untuk mendapatkan riwayat presensi karyawan yang sedang login
const getMyAttendanceHistory = async (req, res) => {
const employee_id = req.user.employee ? req.user.employee.id : null;
try {
if (!employee_id) {
return res.status(400).json({ message: 'Employee ID not found in token. Are you logged in as an employee?' });
}

// 1. Ambil riwayat presensi karyawan ini
const attendances = await Attendance.findAll({
where: {
employee_id: employee_id
},
order: [['date', 'DESC'], ['check_in_time', 'DESC']] // Urutkan berdasarkan tanggal (baru dulu) dan waktu check-in
});

// 2. Kirim response sukses
return res.status(200).json({
message: 'Your attendance history retrieved successfully',
attendances: attendances
});
} catch (error) {
console.error('Error in getMyAttendanceHistory controller:', error);
return res.status(500).json({ message: 'Server error retrieving attendance history' });
}
};
// --- Endpoint untuk Admin: Rekap Presensi ---
// Fungsi untuk mendapatkan rekap presensi semua karyawan (admin only)
const getAttendanceReport = async (req, res) => {
// Bisa menambahkan query parameters untuk filter: date_from, date_to, employee_id, shift_id, location_id
// Untuk sekarang, kita ambil semua
try {
// 1. Ambil semua record presensi, termasuk data karyawan terkait
const attendances = await Attendance.findAll({
include: [
{
model: Employee,
as: 'employee',
attributes: ['id', 'name', 'employee_id', 'position'] // Sesuaikan atribut yang ingin ditampilkan
// Bisa tambah include untuk Shift dan Location jika diperlukan
}
],
order: [['date', 'DESC'], ['check_in_time', 'DESC']] // Urutkan
});

// 2. Kirim response sukses
return res.status(200).json({
message: 'Attendance report retrieved successfully',
attendances: attendances
});
} catch (error) {
console.error('Error in getAttendanceReport controller:', error);
return res.status(500).json({ message: 'Server error retrieving attendance report' });
}
};
// Fungsi untuk mendapatkan detail presensi berdasarkan ID (admin only)
const getAttendanceById = async (req, res) => {
const { id } = req.params;

try {
const attendance = await Attendance.findByPk(id, {
include: [
{
model: Employee,
as: 'employee',
attributes: ['id', 'name', 'employee_id', 'position']
}
]
});

if (!attendance) {
return res.status(404).json({ message: 'Attendance record not found' });
}

return res.status(200).json({
message: 'Attendance record retrieved successfully',
attendance: attendance
});

} catch (error) {
console.error('Error in getAttendanceById controller:', error);
if (error.name === 'SequelizeDatabaseError') {
return res.status(400).json({ message: 'Invalid attendance ID format' });
}
return res.status(500).json({ message: 'Server error retrieving attendance record' });
}
};
// Ekspor semua fungsi controller
module.exports = {
checkIn,
checkOut,
getMyAttendanceHistory,
getAttendanceReport,
getAttendanceById // Tambahkan untuk admin
};