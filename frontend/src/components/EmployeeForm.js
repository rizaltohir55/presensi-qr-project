// frontend/src/components/EmployeeForm.js
'use client';

import { useState, useEffect } from 'react';
import { createEmployee, updateEmployee, getAllShifts, getAllLocations } from '../services/apiService';

export default function EmployeeForm({ employee, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    position: '',
    shift_id: '',
    location_id: '',
    is_active: true,
    role: 'employee', // Default role for new employees
  });
  const [shifts, setShifts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      // If editing an existing employee, pre-fill the form
      setFormData({
        username: employee.user?.username || '',
        // Password is not pre-filled for security reasons
        password: '',
        name: employee.name || '',
        email: employee.email || '',
        position: employee.position || '',
        shift_id: employee.shift_id || '',
        location_id: employee.location_id || '',
        is_active: employee.is_active,
        role: employee.user?.role || 'employee',
      });
    }
  }, [employee]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [shiftsData, locationsData] = await Promise.all([
          getAllShifts(),
          getAllLocations(),
        ]);
        setShifts(shiftsData.shifts || []);
        setLocations(locationsData.locations || []);
      } catch (err) {
        console.error('Failed to fetch shifts or locations:', err);
        setError('Failed to load necessary data for form.');
      }
    };
    fetchDependencies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Convert empty strings for shift_id and location_id to null
    if ((name === 'shift_id' || name === 'location_id') && newValue === '') {
      newValue = null;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (employee) {
        // Update existing employee
        await updateEmployee(employee.id, formData);
      } else {
        // Create new employee
        await createEmployee(formData);
      }
      onSaveSuccess(); // Notify parent component of success
      onClose(); // Close the form
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.message || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={employee ? true : false} // Disable username edit for existing employees
            />
          </div>
          {!employee && ( // Password only for new employees
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
            <input
              type="text"
              name="position"
              id="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="shift_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift</label>
            <select
              name="shift_id"
              id="shift_id"
              value={formData.shift_id || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a Shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>{shift.name} ({shift.start_time}-{shift.end_time})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <select
              name="location_id"
              id="location_id"
              value={formData.location_id || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select a Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Active</label>
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
              {loading ? 'Saving...' : (employee ? 'Update Employee' : 'Add Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
