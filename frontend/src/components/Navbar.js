// frontend/src/components/Navbar.js
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <p className="text-xl font-bold">Presensi QR</p>
        </Link>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {user?.role === 'admin' && (
                <>
                  <Link href="/admin/dashboard">
                    <p className="hover:text-gray-300">Admin Dashboard</p>
                  </Link>
                  <Link href="/admin/shifts">
                    <p className="hover:text-gray-300">Manage Shifts</p>
                  </Link>
                  <Link href="/admin/locations">
                    <p className="hover:text-gray-300">Manage Locations</p>
                  </Link>
                  <Link href="/admin/qr-code-generator">
                    <p className="hover:text-gray-300">Generate QR Code</p>
                  </Link>
                </>
              )}
              {user?.role === 'employee' && (
                <Link href="/employee/dashboard">
                  <p className="hover:text-gray-300">Employee Dashboard</p>
                </Link>
              )}
              <span className="text-gray-400">Hello, {user?.username}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login">
              <p className="hover:text-gray-300">Login</p>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
