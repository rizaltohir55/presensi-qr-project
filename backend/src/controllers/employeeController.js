// backend/src/controllers/employeeController.js
const { Employee, User, Shift, Location } = require('../models'); // Menggunakan db object terpusat
const bcrypt = require('bcryptjs'); // Untuk hashing password default
const { v4: uuidv4 } = require('uuid'); // Untuk membuat employee_id unik jika diperlukan

// Fungsi untuk membuat karyawan baru (Create)
// Ini akan membuat entry di tabel `employees` dan juga membuat user terkait di tabel `users`
const createEmployee = async (req, res) => {
  const { name, email, phone, position, shift_id, location_id, username, password } = req.body;

  try {
    // 1. Validasi input dasar
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required.' });
    }

    // 2. Buat user baru terkait dengan karyawan ini
    // Di banyak sistem, karyawan juga merupakan user yang bisa login
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat user dengan role 'employee'
    const newUser = await User.create({
      username: username,
      password_hash: hashedPassword,
      role: 'employee'
    });

    // 3. Buat employee baru, terhubung dengan user yang baru dibuat
    const newEmployee = await Employee.create({
      // employee_id: `EMP-${uuidv4().substring(0, 8).toUpperCase()}`, // Opsional: ID karyawan unik
      name: name,
      email: email,
      phone: phone,
      position: position,
      shift_id: shift_id, // Bisa null
      location_id: location_id, // Bisa null
      user_id: newUser.id, // Hubungkan dengan user yang baru dibuat
      is_active: true // Default aktif
    });

    // 4. Kirim response sukses
    // Kita bisa memilih untuk mengirim data employee saja, atau employee + user
    return res.status(201).json({
      message: 'Employee and associated user created successfully',
      employee: {
        id: newEmployee.id,
        // employee_id: newEmployee.employee_id,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        position: newEmployee.position,
        shift_id: newEmployee.shift_id,
        location_id: newEmployee.location_id,
        is_active: newEmployee.is_active,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    console.error('Error in createEmployee controller:', error);
    // Tangani error validasi khusus dari Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    // Tangani error duplikasi (misalnya username sudah ada)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Username or email already exists.' });
    }
    // Tangani error jika shift_id atau location_id tidak valid (foreign key constraint)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Invalid shift_id or location_id provided.' });
    }
    // Tangani error lainnya
    return res.status(500).json({ message: 'Server error creating employee' });
  }
};

// Fungsi untuk mendapatkan semua karyawan (Read - All)
const getAllEmployees = async (req, res) => {
  try {
    // 1. Ambil semua karyawan dari database
    // Bisa ditambahkan pagination, sorting, filtering, dan eager loading relasi
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role'] // Hanya ambil field tertentu dari User
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name'] // Hanya ambil field tertentu dari Shift
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name'] // Hanya ambil field tertentu dari Location
        }
      ],
      order: [['name', 'ASC']] // Urutkan berdasarkan nama
    });

    // 2. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'Employees retrieved successfully',
      employees: employees
    });

  } catch (error) {
    console.error('Error in getAllEmployees controller:', error);
    return res.status(500).json({ message: 'Server error retrieving employees' });
  }
};

// Fungsi untuk mendapatkan karyawan berdasarkan ID (Read - Single)
const getEmployeeById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari karyawan berdasarkan ID, termasuk data user terkait
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role']
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'name']
        },
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name']
        }
      ]
    });

    // 2. Jika tidak ditemukan
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 3. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'Employee retrieved successfully',
      employee: employee
    });

  } catch (error) {
    console.error('Error in getEmployeeById controller:', error);
    // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
         return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    return res.status(500).json({ message: 'Server error retrieving employee' });
  }
};

// Fungsi untuk memperbarui karyawan (Update)
const updateEmployee = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { name, email, phone, position, shift_id, location_id, is_active } = req.body;

  try {
    // 1. Cari karyawan yang akan diperbarui
    const employee = await Employee.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 3. Perbarui karyawan dengan data baru
    // Kita hanya izinkan update data employee, bukan user terkait (username/password)
    // Untuk update user, mungkin perlu endpoint terpisah
    if (Object.keys(req.body).length > 0) {
        await employee.update({
          name: name !== undefined ? name : employee.name,
          email: email !== undefined ? email : employee.email,
          phone: phone !== undefined ? phone : employee.phone,
          position: position !== undefined ? position : employee.position,
          shift_id: shift_id !== undefined ? shift_id : employee.shift_id, // Bisa null
          location_id: location_id !== undefined ? location_id : employee.location_id, // Bisa null
          is_active: is_active !== undefined ? is_active : employee.is_active
        });
    }

    // 4. Kirim response sukses dengan data yang diperbarui
    return res.status(200).json({
      message: 'Employee updated successfully',
      employee: employee // employee sudah diperbarui
    });

  } catch (error) {
    console.error('Error in updateEmployee controller:', error);
    // Tangani error validasi
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
     // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
         return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    // Tangani error jika shift_id atau location_id tidak valid
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ message: 'Invalid shift_id or location_id provided.' });
    }
    return res.status(500).json({ message: 'Server error updating employee' });
  }
};

// Fungsi untuk menghapus karyawan (Delete)
const deleteEmployee = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // 1. Cari karyawan yang akan dihapus
    const employee = await Employee.findByPk(id);

    // 2. Jika tidak ditemukan
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 3. Hapus karyawan dari database
    // Karena ada relasi dengan Attendance, kita perlu mempertimbangkan
    // apakah akan mengizinkan penghapusan jika sudah ada data presensi terkait.
    // Untuk sekarang, kita biarkan Sequelize menangani constraint.
    // Catatan: Menghapus employee JUGA akan menghapus user terkait karena relasi 1-1
    // dengan onDelete: CASCADE di foreign key user_id di tabel employees.
    await employee.destroy();

    // 4. Kirim response sukses
    return res.status(200).json({
      message: 'Employee and associated user deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteEmployee controller:', error);
    // Tangani error jika ID tidak valid
    if (error.name === 'SequelizeDatabaseError') {
         return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    // Tangani error constraint (jika ada data terkait dan constraint tidak memperbolehkan delete)
    return res.status(500).json({ message: 'Server error deleting employee' });
  }
};

// Fungsi untuk mendapatkan semua user (Read - All, Admin only)
const getAllUsers = async (req, res) => {
  try {
    // 1. Ambil semua user dari database
    // Kita bisa mengecualikan password_hash untuk keamanan
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'position'] // Ambil beberapa data employee jika ada
      }],
      order: [['username', 'ASC']] // Urutkan berdasarkan username
    });

    // 2. Kirim response sukses dengan data
    return res.status(200).json({
      message: 'Users retrieved successfully',
      users: users
    });

  } catch (error) {
    console.error('Error in getAllUsers controller:', error);
    return res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// Ekspor semua fungsi controller
module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllUsers
};