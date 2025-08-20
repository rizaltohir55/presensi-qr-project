'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllLocations, getAllShifts, api } from '../../../services/apiService';
import Toast from '../../../components/Toast';
import { useAuth } from '../../../context/AuthContext';

const QRCodeGeneratorPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [qrCodeId, setQrCodeId] = useState('');
  const [validUntil, setValidUntil] = useState(null); // To store the expiration time
  const [timeLeft, setTimeLeft] = useState(0); // To store countdown time in seconds
  const [attendedEmployees, setAttendedEmployees] = useState([]); // New state for attended employees

  const fetchAttendedEmployees = useCallback(async (qrCode) => {
    try {
      const response = await api.get('/admin/attendances', { params: { qrCode: qrCode } });
      setAttendedEmployees(response.attendances);
    } catch (error) {
      console.error('Error fetching attended employees:', error);
      setToast({ message: error.message || 'Failed to fetch attended employees.', type: 'error' });
      setAttendedEmployees([]); // Clear list on error
    }
  }, [setToast]);

  const handleGenerateQRCode = useCallback(async () => {
    try {
      setToast({ message: '', type: '' }); // Clear previous toast
      const response = await api.post('/admin/qr-codes/generate-new', {
        location_id: selectedLocation || undefined,
        shift_id: selectedShift || undefined,
      });
      setQrCodeImage(response.qrCodeImage);
      setValidUntil(new Date(response.valid_until)); // Store as Date object
      setQrCodeId(response.qrCodeId); // Store the new qrCodeId
      setGeneratedCode(response.uniqueCode); // Set generatedCode for display
      setToast({ message: response.message, type: 'success' });
      // Save to localStorage after successful generation
      localStorage.setItem('lastGeneratedQRCodeImage', response.qrCodeImage);
      localStorage.setItem('lastGeneratedQRCodeId', response.qrCodeId);
      localStorage.setItem('lastGeneratedQRCodeValidUntil', response.valid_until); // Store ISO string
      localStorage.setItem('lastGeneratedQRCodeCode', response.uniqueCode); // Save the unique code for manual entry
      localStorage.setItem('lastSelectedLocation', selectedLocation); // Save selected location
      localStorage.setItem('lastSelectedShift', selectedShift); // Save selected shift
      // After successful QR code generation, fetch attended employees for this QR code
      fetchAttendedEmployees(response.uniqueCode);
    } catch (error) {
      console.error('Error generating QR Code:', error);
      setToast({ message: error.message || 'Failed to generate QR Code.', type: 'error' });
    }
  }, [selectedLocation, selectedShift, setToast, setQrCodeImage, setValidUntil, setQrCodeId, fetchAttendedEmployees]); // Added fetchAttendedEmployees to dependencies

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/login');
      } else {
        const init = async () => {
          await fetchLocationsAndShifts();

          // Load from localStorage on mount
          const storedImage = localStorage.getItem('lastGeneratedQRCodeImage');
          const storedId = localStorage.getItem('lastGeneratedQRCodeId');
          const storedValidUntil = localStorage.getItem('lastGeneratedQRCodeValidUntil');
          const storedCode = localStorage.getItem('lastGeneratedQRCodeCode'); // Load the unique code
          const storedLocation = localStorage.getItem('lastSelectedLocation'); // Load selected location
          const storedShift = localStorage.getItem('lastSelectedShift'); // Load selected shift

          // Set selected location and shift from localStorage if available and not already set
          if (storedLocation && selectedLocation === '') setSelectedLocation(storedLocation);
          if (storedShift && selectedShift === '') setSelectedShift(storedShift);

          if (storedImage && storedId && storedValidUntil && storedCode) {
            const validUntilDate = new Date(storedValidUntil);
            // Check if the stored QR code is still valid
            if (validUntilDate > new Date()) {
              setQrCodeImage(storedImage);
              setQrCodeId(storedId);
              setValidUntil(validUntilDate);
              setGeneratedCode(storedCode); // Set the generatedCode
              fetchAttendedEmployees(storedCode); // Fetch attended employees for the loaded QR code
            } else {
              // If expired, clear stored QR code data to force new generation on button click
              localStorage.removeItem('lastGeneratedQRCodeImage');
              localStorage.removeItem('lastGeneratedQRCodeId');
              localStorage.removeItem('lastGeneratedQRCodeValidUntil');
              localStorage.removeItem('lastGeneratedQRCodeCode');
              localStorage.removeItem('lastSelectedLocation');
              localStorage.removeItem('lastSelectedShift');
              setQrCodeImage('');
              setQrCodeId('');
              setValidUntil(null);
              setGeneratedCode('');
              setAttendedEmployees([]); // Clear attended employees if QR is expired
            }
          }
        };
        init();
      }
    }
  }, [isLoading, isAuthenticated, user, router, handleGenerateQRCode, fetchAttendedEmployees]); // Added fetchAttendedEmployees to dependencies

  // Countdown timer and auto-refresh effect for QR code
  useEffect(() => {
    let timer;
    if (validUntil) {
      timer = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((validUntil.getTime() - now.getTime()) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(timer);
          handleGenerateQRCode(); // Generate new QR code when time runs out
        }
      }, 1000);
    }

    return () => clearInterval(timer); // Cleanup on unmount or validUntil change
  }, [validUntil, handleGenerateQRCode]); // Added handleGenerateQRCode to dependencies

  // Effect to periodically fetch attended employees
  useEffect(() => {
    let fetchInterval;
    if (generatedCode) { // Only fetch if a QR code is active
      fetchInterval = setInterval(() => {
        fetchAttendedEmployees(generatedCode);
      }, 5000); // Refresh every 5 seconds
    }

    return () => clearInterval(fetchInterval); // Cleanup on unmount or generatedCode change
  }, [generatedCode, fetchAttendedEmployees]);

  const fetchLocationsAndShifts = async () => {
    try {
      const locationsResponse = await getAllLocations();
      setLocations(locationsResponse.locations);

      const shiftsResponse = await getAllShifts();
      setShifts(shiftsResponse.shifts);
    } catch (error) {
      console.error('Error fetching locations and shifts:', error);
      setToast({ message: error.message || 'Failed to load locations and shifts.', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate QR Code for Attendance</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
            Select Location (Optional):
          </label>
          <select
            id="location"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">-- Select a Location --</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="shift" className="block text-gray-700 text-sm font-bold mb-2">
            Select Shift (Optional):
          </label>
          <select
            id="shift"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
          >
            <option value="">-- Select a Shift --</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateQRCode}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Generate QR Code
        </button>
      </div>

      {qrCodeImage && (
        <div className="flex flex-col md:flex-row gap-6"> {/* Flex container for QR and list */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center flex-1">
            <h2 className="text-xl font-bold mb-4">Generated QR Code</h2>
            <p className="text-lg mb-2">Unique Code: <span className="font-mono text-blue-600">{generatedCode.slice(-6)}</span></p>
            {timeLeft > 0 ? (
              <p className="text-lg mb-2">QR Code valid for: <span className="font-mono text-blue-600">{timeLeft} seconds</span></p>
            ) : (
              <p className="text-lg mb-2 text-red-600">Generating new QR Code...</p>
            )}
            <img src={qrCodeImage} alt="Generated QR Code" className="mx-auto border border-gray-300 p-2" />
            <p className="text-sm text-gray-500 mt-2">Scan this QR code for attendance.</p>
          </div>
          {/* Attended Employees List */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-1">
            <h2 className="text-xl font-bold mb-4">Attended Employees</h2>
            {attendedEmployees.length > 0 ? (
              <ul className="list-disc pl-5">
                {attendedEmployees.map((attendance) => (
                  <li key={attendance.id} className="mb-2">
                    <strong>{attendance.employee.name}</strong> - Check-in: {new Date(attendance.check_in_time).toLocaleTimeString()}
                    {attendance.check_out_time && ` / Check-out: ${new Date(attendance.check_out_time).toLocaleTimeString()}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No employees have attended yet for this QR code.</p>
            )}
          </div>
        </div>
      )}

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
    </div>
  );
};

export default QRCodeGeneratorPage;