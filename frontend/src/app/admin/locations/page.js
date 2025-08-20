// frontend/src/app/admin/locations/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../../../services/apiService';
import LocationForm from '../../../components/LocationForm';
import Toast from '../../../components/Toast';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLocationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [errorLocations, setErrorLocations] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    setErrorLocations(null);
    try {
      const data = await getAllLocations();
      setLocations(data.locations); // Assuming the API returns { locations: [...] }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setErrorLocations(err.message || 'Failed to load locations.');
    } finally {
      setLoadingLocations(false);
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

  // Fetch locations data on component mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchLocations();
    }
  }, [isAuthenticated, user, fetchLocations]);

  const handleAddLocation = () => {
    setCurrentLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location) => {
    setCurrentLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(locationId);
        fetchLocations(); // Refresh the list
        setToastMessage('Location deleted successfully!');
        setToastType('success');
      } catch (err) {
        console.error('Failed to delete location:', err);
        setToastMessage(err.message || 'Failed to delete location.');
        setToastType('error');
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    fetchLocations(); // Refresh the list
    setToastMessage('Location saved successfully!');
    setToastType('success');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentLocation(null);
  };

  if (isLoading || loadingLocations) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Atau tampilkan pesan akses ditolak
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Location List</h2>
        <button
          onClick={handleAddLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add New Location
        </button>
      </div>

      {errorLocations && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          {errorLocations}
        </div>
      )}

      {locations.length === 0 && !loadingLocations && !errorLocations ? (
        <p>No locations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Address</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Latitude</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Longitude</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {locations.map((location) => (
                <tr key={location.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td className="py-2 px-4">{location.name}</td>
                  <td className="py-2 px-4">{location.address}</td>
                  <td className="py-2 px-4">{location.latitude}</td>
                  <td className="py-2 px-4">{location.longitude}</td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => handleEditLocation(location)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
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

      <div className={`${showForm ? 'block' : 'hidden'}`}>
        <LocationForm
          location={currentLocation}
          onClose={handleCloseForm}
          onSaveSuccess={handleSaveSuccess}
        />
      </div>

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
