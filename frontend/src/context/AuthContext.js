// frontend/src/context/AuthContext.js
'use client'; // Directive penting karena ini akan digunakan di komponen client

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Untuk navigasi di App Router
import { getProfile } from '../services/apiService'; // Untuk verifikasi token

//Buat Context
const AuthContext = createContext();
// Buat Custom Hook untuk menggunakan Context dengan mudah
export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within an AuthProvider');
}
return context;
};
// 3. Buat Provider Component
export const AuthProvider = ({ children }) => {
const [authState, setAuthState] = useState({
token: null,
user: null,
isAuthenticated: false,
isLoading: true, // Tambahkan state loading untuk inisialisasi
});
const router = useRouter();
// Fungsi untuk login
const login = (token, userData) => {
// Simpan token ke sessionStorage
if (typeof window !== 'undefined') {
sessionStorage.setItem('token', token);
}
// Update state
setAuthState({
token,
user: userData,
isAuthenticated: true,
isLoading: false,
});
// Arahkan ke dashboard berdasarkan role
// Kita akan tangani ini di komponen login nanti
};
// Fungsi untuk logout
const logout = () => {
// Hapus token dari sessionStorage
if (typeof window !== 'undefined') {
sessionStorage.removeItem('token');
}
// Reset state
setAuthState({
token: null,
user: null,
isAuthenticated: false,
isLoading: false,
});
// Arahkan ke halaman login
router.push('/login');
};
// Fungsi untuk memuat token dari sessionStorage saat aplikasi pertama kali dimuat
// dan memverifikasi apakah token masih valid
useEffect(() => {
const initializeAuth = async () => {
if (typeof window !== 'undefined') {
const storedToken = sessionStorage.getItem('token');
if (storedToken) {
try {
// Verifikasi token dengan memanggil endpoint profil
const profileData = await getProfile();
// Jika berhasil, token valid
setAuthState({
token: storedToken,
user: profileData.user, // Data user dari API
isAuthenticated: true,
isLoading: false,
});
} catch (err) {
// Jika gagal (misalnya token expired), hapus token
console.error('Token verification failed:', err);
sessionStorage.removeItem('token');
setAuthState({
token: null,
user: null,
isAuthenticated: false,
isLoading: false,
});
}
} else {
// Tidak ada token di sessionStorage
setAuthState(prev => ({ ...prev, isLoading: false }));
}
} else {
// Bukan di browser (server-side), set isLoading false
setAuthState(prev => ({ ...prev, isLoading: false }));
}
};

initializeAuth();
}, []); // Hanya dijalankan sekali saat komponen mount
// Nilai yang akan disediakan oleh Context
const value = {
...authState, // token, user, isAuthenticated, isLoading
login,
logout,
};
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};