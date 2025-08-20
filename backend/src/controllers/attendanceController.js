// backend/src/controllers/attendanceController.js
const { Attendance, Employee, QRCode, Shift, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- Endpoint untuk Karyawan: Presensi (Check-in/Check-out) ---
// Fungsi untuk check-in (oleh karyawan)
const checkIn = async (req, res) => {
  const { qr_code } = req.body; // Kode QR yang discan
  const employee_id = req.user.employee ? req.user.employee.id : null; // ID karyawan dari token

  console.log('Check-in request received. QR Code:', qr_code);
  console.log('Employee ID:', employee_id);

  try {
    // Validasi input dasar
    if (!qr_code) {
      return res.status(400).json({ message: 'QR code is required.' });
    }
    if (!employee_id) {
      return res.status(400).json({ message: 'Employee ID not found in token. Are you logged in as an employee?' });
    }

    // 1. Cari QR Code berdasarkan kode
    const qrRecord = await QRCode.findOne({ where: { code: qr_code } });
    console.log('QR Record found for check-in:', qrRecord ? qrRecord.toJSON() : 'None');

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
    if (qrRecord.type !== 'check_in' && qrRecord.type !== 'general') {
      return res.status(400).json({ message: 'This QR code is not for check-in.' });
    }

    // 2. Dapatkan data karyawan beserta shift-nya
    const employee = await Employee.findByPk(employee_id, {
      include: [{ model: Shift, as: 'shift' }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    if (!employee.shift) {
      return res.status(400).json({ message: 'Employee does not have an assigned shift.' });
    }

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Cek apakah karyawan sudah melakukan check-in hari ini
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id: employee_id,
        date: today
      }
    });

    if (existingAttendance && existingAttendance.check_in_time) {
      return res.status(400).json({ message: 'You have already checked in today.' });
    }

    // Logika validasi waktu check-in berdasarkan shift
    const shiftStartTime = new Date(`${today}T${employee.shift.start_time}`);
    const checkInWindowEnd = new Date(shiftStartTime.getTime() + 15 * 60 * 1000); // Shift start time + 15 minutes

    if (now > checkInWindowEnd) {
      return res.status(400).json({ message: 'Check-in is closed. You are more than 15 minutes late for your shift.' });
    }

    let status = 'present';
    if (now > shiftStartTime) {
      status = 'late';
    }

    let attendanceRecord;
    if (existingAttendance) {
      attendanceRecord = await existingAttendance.update({
        check_in_time: now,
        qr_code_used: qr_code,
        status: status
      });
    } else {
      attendanceRecord = await Attendance.create({
        employee_id: employee_id,
        date: today,
        check_in_time: now,
        qr_code_used: qr_code,
        status: status
      });
    }

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

console.log('Check-out request received. QR Code:', qr_code);
console.log('Employee ID:', employee_id);

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
console.log('QR Record found for check-out:', qrRecord ? qrRecord.toJSON() : 'None');

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

// 4. Dapatkan data karyawan beserta shift-nya
const employee = await Employee.findByPk(employee_id, {
  include: [{ model: Shift, as: 'shift' }]
});

if (!employee) {
  return res.status(404).json({ message: 'Employee not found.' });
}
if (!employee.shift) {
  return res.status(400).json({ message: 'Employee does not have an assigned shift.' });
}

// 5. Dapatkan tanggal hari ini (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// 6. Cari record presensi hari ini untuk karyawan ini
const attendanceRecord = await Attendance.findOne({
where: {
employee_id: employee_id,
date: today
}
});

// 7. Validasi apakah sudah check-in
if (!attendanceRecord) {
return res.status(400).json({ message: 'You have not checked in today. Cannot check out.' });
}
if (!attendanceRecord.check_in_time) {
return res.status(400).json({ message: 'You have not checked in today. Cannot check out.' });
}
if (attendanceRecord.check_out_time) {
return res.status(400).json({ message: 'You have already checked out today.' });
}

// Logika validasi waktu check-out berdasarkan shift
const shiftEndTime = new Date(`${today}T${employee.shift.end_time}`);
const checkOutWindowStart = new Date(shiftEndTime.getTime() - 15 * 60 * 1000); // Shift end time - 15 minutes

if (now < checkOutWindowStart) {
  return res.status(400).json({ message: 'Check-out is not yet open. You can check out 15 minutes before your shift ends.' });
}

// Optional: If check-out is after shift end time, you might want to mark it as late or prevent it
// For now, we'll allow it but you can add more specific logic here if needed.
// if (now > shiftEndTime) {
//   return res.status(400).json({ message: 'Check-out is closed. You are more than 15 minutes late for your shift.' });
// }

// 8. Update record presensi dengan waktu check-out
const updatedAttendance = await attendanceRecord.update({
check_out_time: new Date(),
});

// 9. Kirim response sukses
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
include: [ // Tambahkan include untuk memuat data employee
{
model: Employee,
as: 'employee',
attributes: ['name', 'position'] // Hanya ambil atribut yang diperlukan
}
],
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
  const { qrCode, date_from, date_to, employee_id, shift_id, location_id } = req.query; // Ambil query parameters

  try {
    const whereClause = {};

    if (qrCode) {
      whereClause.qr_code_used = qrCode;
    }
    if (date_from && date_to) {
      whereClause.date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      whereClause.date = { [Op.gte]: date_from };
    } else if (date_to) {
      whereClause.date = { [Op.lte]: date_to };
    }
    if (employee_id) {
      whereClause.employee_id = employee_id;
    }
    // Tambahkan filter untuk shift_id dan location_id jika diperlukan

    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'position']
        }
      ],
      order: [['date', 'DESC'], ['check_in_time', 'DESC']]
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
console.log('Attempting to fetch attendance by ID:', id);

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
getAttendanceById
};