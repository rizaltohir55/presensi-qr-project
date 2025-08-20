// frontend/src/components/ShiftForm.js
'use client';

import { useState, useEffect } from 'react';
import { createShift, updateShift } from '../services/apiService';

export default function ShiftForm({ shift, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shift) {
      // If editing an existing shift, pre-fill the form
      setFormData({
        name: shift.name || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
      });
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (shift) {
        // Update existing shift
        await updateShift(shift.id, formData);
      } else {
        // Create new shift
        await createShift(formData);
      }
      onSaveSuccess(); // Notify parent component of success
      onClose(); // Close the form
    } catch (err) {
      console.error('Error saving shift:', err);
      setError(err.message || 'Failed to save shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{shift ? 'Edit Shift' : 'Add New Shift'}</h2>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              type="time"
              name="start_time"
              id="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
            <input
              type="time"
              name="end_time"
              id="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading ? 'Saving...' : (shift ? 'Update Shift' : 'Add Shift')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
