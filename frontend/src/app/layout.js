// frontend/src/app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext"; // pastikan path context benar
import Navbar from "../components/Navbar"; // Import Navbar component

// Pakai Google Font Inter supaya tidak error file missing
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Presensi Online",
  description: "Website presensi dengan QR Code",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Bungkus children dengan AuthProvider */}
        <AuthProvider>
          <Navbar /> {/* Add Navbar here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
