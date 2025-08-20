// frontend/src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin } from '../../services/apiService'; // Ganti nama import untuk menghindari konflik
import { useAuth } from '../../context/AuthContext'; // Impor useAuth

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Dapatkan fungsi login dari context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Panggil fungsi login dari apiService
      const data = await apiLogin({ username, password });
      console.log('Login successful:', data);

      // Gunakan fungsi login dari context untuk menyimpan token dan user data
      login(data.token, data.user);

      // Arahkan ke halaman dashboard berdasarkan role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard'); // Arahkan ke dashboard admin
      } else if (data.user.role === 'employee') {
        router.push('/employee/dashboard'); // Arahkan ke dashboard karyawan
      } else {
        // Jika role tidak dikenali, arahkan ke halaman utama atau profil
        router.push('/');
      }

    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Kontainer utama dengan padding dan layout flex
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      {/* Bagian header halaman login */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Judul halaman login */}
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      {/* Bagian form login */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Tampilkan pesan error jika ada */}
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
            {error}
          </div>
        )}

        {/* Form login dengan metode POST */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Input field untuk Username/Email */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-white">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Input field untuk Password */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                Password
              </label>
              {/* Tautan lupa password (opsional untuk awal) */}
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Tombol Login */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-400'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        {/* Bagian sign up (opsional untuk awal) */}
        {/* <p className="mt-10 text-center text-sm text-gray-400">
          Not a member?{' '}
          <a href="#" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
            Start a 14 day free trial
          </a>
        </p> */}
      </div>
    </div>
  );
}