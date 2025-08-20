"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di Aplikasi Presensi QR</h1>
        <p className="text-lg mb-8">
          Solusi mudah untuk mencatat kehadiran. Cepat, akurat, dan efisien.
        </p>
        <Link href="/login" legacyBehavior>
          <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </a>
        </Link>
      </div>
    </main>
  );
}