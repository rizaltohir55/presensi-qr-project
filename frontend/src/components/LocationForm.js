// frontend/src/components/LocationForm.js
'use client';

import { useState, useEffect } from 'react';
import { createLocation, updateLocation, geocodeAddress } from '../services/apiService';
import Toast from './Toast'; // Import the Toast component

export default function LocationForm({ location, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '',
  });
  const [loading, setLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false); // New loading state for geocoding
  const [errors, setErrors] = useState({}); // State for field-specific errors
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        radius: location.radius || '',
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field being changed
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: null,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Location Name is required.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    }
    if (!formData.latitude.toString().trim()) {
      newErrors.latitude = 'Latitude is required.';
    } else if (isNaN(formData.latitude)) {
      newErrors.latitude = 'Latitude must be a number.';
    }
    if (!formData.longitude.toString().trim()) {
      newErrors.longitude = 'Longitude is required.';
    } else if (isNaN(formData.longitude)) {
      newErrors.longitude = 'Longitude must be a number.';
    }
    if (!formData.radius.toString().trim()) {
      newErrors.radius = 'Radius is required.';
    } else if (isNaN(formData.radius)) {
      newErrors.radius = 'Radius must be a number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeocode = async () => {
    if (!formData.address.trim()) {
      setToastMessage('Please enter an address to geocode.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setGeocodingLoading(true);
    try {
      const { latitude, longitude } = await geocodeAddress(formData.address);
      setFormData((prevData) => ({
        ...prevData,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      }));
      setToastMessage('Coordinates found successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      setToastMessage(err.message || 'Failed to get coordinates for the address.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setToastMessage('Please correct the errors in the form.');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const dataToSave = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius),
      };

      if (location) {
        await updateLocation(location.id, dataToSave);
        setToastMessage('Location updated successfully!');
      } else {
        await createLocation(dataToSave);
        setToastMessage('Location added successfully!');
      }
      setToastType('success');
      setShowToast(true);
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving location:', err);
      setToastMessage(err.message || 'Failed to save location.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{location ? 'Edit Location' : 'Add New Location'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocodingLoading || !formData.address.trim()}
                className="mt-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {geocodingLoading ? 'Getting...' : 'Get Coords'}
              </button>
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>}
          </div>
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
            <input
              type="number"
              name="latitude"
              id="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.latitude ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
            />
            {errors.latitude && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.latitude}</p>}
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
            <input
              type="number"
              name="longitude"
              id="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.longitude ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
            />
            {errors.longitude && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.longitude}</p>}
          </div>
          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Radius (meters)</label>
            <input
              type="number"
              name="radius"
              id="radius"
              value={formData.radius}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.radius ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
            />
            {errors.radius && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.radius}</p>}
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
              {loading ? 'Saving...' : (location ? 'Update Location' : 'Add Location')}
            </button>
          </div>
        </form>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}