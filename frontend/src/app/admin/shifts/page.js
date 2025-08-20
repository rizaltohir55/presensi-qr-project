// frontend/src/app/admin/shifts/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllShifts, createShift, updateShift, deleteShift } from '../../../services/apiService';
import ShiftForm from '../../../components/ShiftForm';
import Toast from '../../../components/Toast';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminShiftsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [errorShifts, setErrorShifts] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  const fetchShifts = useCallback(async () => {
    setLoadingShifts(true);
    setErrorShifts(null);
    try {
      const data = await getAllShifts();
      setShifts(data.shifts); // Assuming the API returns { shifts: [...] }
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
      setErrorShifts(err.message || 'Failed to load shifts.');
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  // Redirect jika bukan admin atau belum login
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'admin') {
        router.push('/employee/dashboard'); // Redirect non-admin to employee dashboard
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Fetch shifts data on component mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchShifts();
    }
  }, [isAuthenticated, user, fetchShifts]);

  const handleAddShift = () => {
    setCurrentShift(null);
    setShowForm(true);
  };

  const handleEditShift = (shift) => {
    setCurrentShift(shift);
    setShowForm(true);
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(shiftId);
        fetchShifts(); // Refresh the list
        setToastMessage('Shift deleted successfully!');
        setToastType('success');
      } catch (err) {
        console.error('Failed to delete shift:', err);
        setToastMessage(err.message || 'Failed to delete shift.');
        setToastType('error');
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    fetchShifts(); // Refresh the list
    setToastMessage('Shift saved successfully!');
    setToastType('success');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentShift(null);
  };

  if (isLoading || loadingShifts) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Atau tampilkan pesan akses ditolak
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Shifts</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Shift List</h2>
        <button
          onClick={handleAddShift}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add New Shift
        </button>
      </div>

      {errorShifts && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          {errorShifts}
        </div>
      )}

      {shifts.length === 0 && !loadingShifts && !errorShifts ? (
        <p>No shifts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Start Time</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">End Time</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td className="py-2 px-4">{shift.name}</td>
                  <td className="py-2 px-4">{shift.start_time}</td>
                  <td className="py-2 px-4">{shift.end_time}</td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => handleEditShift(shift)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ShiftForm
          shift={currentShift}
          onClose={handleCloseForm}
          onSaveSuccess={handleSaveSuccess}
        />
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
