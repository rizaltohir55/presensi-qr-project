// frontend/src/app/employee/dashboard/page.js
'use client'; // Jika menggunakan hooks atau context di sini

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyAttendanceHistory, checkIn, checkOut } from '../../../services/apiService'; // Import checkIn, checkOut
import Toast from '../../../components/Toast'; // Import Toast
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), {
  ssr: false,
});

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [errorAttendance, setErrorAttendance] = useState(null);
  const [scannedQrCode, setScannedQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  // Redirect jika bukan employee atau belum login
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'employee') {
        // Jika sudah login tetapi bukan employee, arahkan ke halaman admin
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Fetch attendance history
  const fetchAttendanceHistory = async () => {
    setLoadingAttendance(true);
    setErrorAttendance(null);
    try {
      const data = await getMyAttendanceHistory();
      setAttendanceHistory(data.attendances); // Assuming the API returns { attendances: [...] }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
      setErrorAttendance(err.message || 'Failed to load attendance history.');
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'employee') {
      fetchAttendanceHistory();
    }
  }, [isAuthenticated, user]);

  const handleScan = (result) => {
    console.log('Full result object from scanner:', result);
    if (result && result.length > 0) {
      const scannedItem = result[0];
      console.log('First item in result array:', scannedItem);
      if (scannedItem && scannedItem.rawValue) {
        const rawQrData = scannedItem.rawValue;
        console.log('QR Code Scanned (raw data):', rawQrData);
        try {
          const parsedQrData = JSON.parse(rawQrData);
          if (parsedQrData && parsedQrData.code && parsedQrData.valid_until) {
            const qrValidUntil = new Date(parsedQrData.valid_until);
            const now = new Date();

            if (now > qrValidUntil) {
              setToastMessage('QR Code has expired. Please scan a new one.');
              setToastType('error');
              setScannedQrCode(''); // Clear invalid QR
            } else {
              setScannedQrCode(parsedQrData.code);
              console.log('Extracted QR Code:', parsedQrData.code);
              setToastMessage('QR Code scanned successfully!');
              setToastType('success');
            }
          } else {
            console.error('Parsed QR data does not contain "code" or "valid_until" property:', parsedQrData);
            setToastMessage('Invalid QR Code format: Missing "code" or "valid_until" property.');
            setToastType('error');
            setScannedQrCode(''); // Clear invalid QR
          }
        } catch (e) {
          console.error('Failed to parse QR data as JSON:', e);
          setToastMessage('Invalid QR Code format: Not a valid JSON.');
          setToastType('error');
          setScannedQrCode(''); // Clear invalid QR
        }
        setIsScanning(false);
        setQrError(null);
      } else {
        console.log('QR Code Scanned: First item has no text property or text is empty.', scannedItem);
        setToastMessage('No readable data found in QR Code.');
        setToastType('error');
        setScannedQrCode(''); // Clear any previous QR
      }
    } else {
      console.log('QR Code Scanned: No data received. Full result object:', result);
      setToastMessage('No QR Code data detected.');
      setToastType('error');
      setScannedQrCode(''); // Clear any previous QR
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error (full object):', err); // Log the full error object
    let errorMessage = 'Error scanning QR code. Please ensure camera access.';
    if (err && err.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please grant camera permissions in your browser settings.';
    } else if (err && err.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please ensure a camera is connected and enabled.';
    } else if (err && err.message) {
      errorMessage = `QR Scanner Error: ${err.message}`;
    }
    setQrError(errorMessage);
  };

  useEffect(() => {
    console.log('isScanning state changed:', isScanning);
  }, [isScanning]);

  const handleCheckIn = async () => {
    if (!scannedQrCode) {
      setToastMessage('Please scan a QR code or enter it manually.');
      setToastType('error');
      return;
    }
    try {
      await checkIn(scannedQrCode);
      setToastMessage('Check-in successful!');
      setToastType('success');
      setScannedQrCode(''); // Clear QR code after successful operation
      fetchAttendanceHistory(); // Refresh history
    } catch (err) {
      console.error('Check-in failed:', err);
      setToastMessage(err.message || 'Check-in failed. Please try again.');
      setToastType('error');
    }
  };

  const handleCheckOut = async () => {
    if (!scannedQrCode) {
      setToastMessage('Please scan a QR code or enter it manually.');
      setToastType('error');
      return;
    }
    try {
      await checkOut(scannedQrCode);
      setToastMessage('Check-out successful!');
      setToastType('success');
      setScannedQrCode(''); // Clear QR code after successful operation
      fetchAttendanceHistory(); // Refresh history
    } catch (err) {
      console.error('Check-out failed:', err);
      setToastMessage(err.message || 'Check-out failed. Please try again.');
      setToastType('error');
    }
  };

  if (isLoading || loadingAttendance) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated || (user && user.role !== 'employee')) {
    return null; // Atau tampilkan pesan akses ditolak
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
      <p>Selamat datang, {user?.username}!</p>
      <p>Role Anda: {user?.role}</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">Your Profile</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <p><strong>Name:</strong> {user?.employee?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {user?.employee?.email || 'N/A'}</p>
        <p><strong>Position:</strong> {user?.employee?.position || 'N/A'}</p>
        <p><strong>Active:</strong> {user?.employee?.is_active ? 'Yes' : 'No'}</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">Attendance Actions</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="mb-4">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2"
          >
            {isScanning ? 'Stop Scan' : 'Scan QR Code'}
          </button>
          <input
            type="text"
            placeholder="Or enter QR code manually"
            value={scannedQrCode}
            onChange={(e) => setScannedQrCode(e.target.value)}
            className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          />
        </div>

        {isScanning && (
          <div className="mb-4 p-4 border rounded-md bg-gray-100 dark:bg-gray-700">
            <QrScanner
              onScan={(result) => {
                handleScan(result);
              }}
              onError={(error) => {
                handleError(error);
              }}
              // key={isScanning ? 'scanning' : 'not-scanning'} // Remove this line
              style={{ width: '100%' }}
              // videoConstraints={{
              //   // Use 'environment' for the rear camera, which is generally better for scanning physical QR codes.
              //   // Use 'user' for the front camera.
              //   facingMode: 'environment'
              // }}
              scanDelay={300} // Add a small delay
              formats={['qr_code']} // Specify QR code format
              // styles={{
              //   video: {
              //     transform: 'scaleX(-1)'
              //   }
              // }}
            />
            {qrError && <p className="text-red-500 mt-2">{qrError}</p>}
          </div>
        )}

        {scannedQrCode && (
          <p className="mb-4 text-gray-700 dark:text-gray-300">Scanned/Entered QR: <strong>{scannedQrCode}</strong></p>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleCheckIn}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Check-in
          </button>
          <button
            onClick={handleCheckOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Check-out
          </button>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Attendance History</h2>
      {errorAttendance && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          {errorAttendance}
        </div>
      )}

      {attendanceHistory.length === 0 && !loadingAttendance && !errorAttendance ? (
        <p>No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Date</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Check-in Time</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Check-out Time</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {attendanceHistory.map((record) => (
                <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td className="py-2 px-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : 'N/A'}</td>
                  <td className="py-2 px-4">{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : 'N/A'}</td>
                  <td className="py-2 px-4">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
