// frontend/src/services/apiService.js
import axios from 'axios';

// Membuat instance Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menambahkan interceptor untuk request
// Ini akan menambahkan token Authorization ke setiap request secara otomatis
api.interceptors.request.use(
  (config) => {
    // Hanya jalankan di sisi client (browser)
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Menambahkan interceptor untuk response
// Ini akan menangani error secara global
api.interceptors.response.use(
  (response) => {
    // Axios secara otomatis mengembalikan `response.data`
    return response.data;
  },
  (error) => {
    // Tangani error dari response (misal: 401, 404, 500)
    if (error.response) {
      // Server merespons dengan status error
      // Kita bisa melempar pesan error dari backend
      return Promise.reject(new Error(error.response.data.message || 'An error occurred'));
    } else if (error.request) {
      // Request dibuat tapi tidak ada response diterima
      return Promise.reject(new Error('No response from server. Please check your network.'));
    } else {
      // Error terjadi saat setup request
      return Promise.reject(new Error(error.message));
    }
  }
);

// --- Fungsi API menggunakan instance Axios ---

// Fungsi spesifik untuk login
export const login = async (credentials) => {
  return api.post('/auth/login', credentials);
};

// Fungsi spesifik untuk mendapatkan profil
export const getProfile = async () => {
  return api.get('/auth/profile');
};

// --- Fungsi untuk Admin (Shifts CRUD) ---
export const getAllShifts = async () => {
  return api.get('/admin/shifts');
};

export const createShift = async (shiftData) => {
  return api.post('/admin/shifts', shiftData);
};

export const updateShift = async (id, shiftData) => {
  return api.put(`/admin/shifts/${id}`, shiftData);
};

export const deleteShift = async (id) => {
  return api.delete(`/admin/shifts/${id}`);
};

// --- Fungsi untuk Admin (Locations CRUD) ---
export const getAllLocations = async () => {
  return api.get('/admin/locations');
};

export const createLocation = async (locationData) => {
  return api.post('/admin/locations', locationData);
};

export const updateLocation = async (id, locationData) => {
  return api.put(`/admin/locations/${id}`, locationData);
};

export const deleteLocation = async (id) => {
  return api.delete(`/admin/locations/${id}`);
};

// --- Fungsi untuk Admin (Employees CRUD) ---
export const getAllEmployees = async () => {
  return api.get('/admin/employees');
};

export const createEmployee = async (employeeData) => {
  return api.post('/admin/employees', employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return api.put(`/admin/employees/${id}`, employeeData);
};

export const deleteEmployee = async (id) => {
  return api.delete(`/admin/employees/${id}`);
};

// --- Fungsi untuk Karyawan ---
export const getMyAttendanceHistory = async () => {
  return api.get('/employee/history');
};

export const checkIn = async (qrCode) => {
  return api.post('/employee/check-in', { qr_code: qrCode });
};

export const checkOut = async (qrCode) => {
  return api.post('/employee/check-out', { qr_code: qrCode });
};

// Fungsi untuk geocoding alamat menggunakan OpenStreetMap Nominatim
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        // Penting: Nominatim meminta User-Agent yang jelas
        'User-Agent': 'PresensiQRApp/1.0 (your_email@example.com)' // Ganti dengan email atau nama aplikasi Anda
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      throw new Error('Address not found.');
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error(error.message || 'Failed to geocode address.');
  }
};