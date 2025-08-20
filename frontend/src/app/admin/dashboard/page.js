// frontend/src/app/admin/dashboard/page.js
'use client'; // Jika menggunakan hooks atau context di sini

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getAllEmployees, deleteEmployee } from '../../../services/apiService'; // Import deleteEmployee
import EmployeeForm from '../../../components/EmployeeForm'; // Import EmployeeForm
import Toast from '../../../components/Toast'; // Import Toast

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errorEmployees, setErrorEmployees] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data.employees); // Assuming the API returns { employees: [...] }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setErrorEmployees(err.message || 'Failed to load employees.');
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Redirect jika bukan admin atau belum login
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'admin') {
        // Jika sudah login tetapi bukan admin, arahkan ke halaman karyawan
        router.push('/employee/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Fetch employees data on component mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      fetchEmployees();
    }
  }, [isAuthenticated, user, fetchEmployees]);

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId);
        fetchEmployees(); // Refresh the list
        setToastMessage('Employee deleted successfully!');
        setToastType('success');
      } catch (err) {
        console.error('Failed to delete employee:', err);
        setToastMessage(err.message || 'Failed to delete employee.');
        setToastType('error');
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    fetchEmployees(); // Refresh the list
    setToastMessage('Employee saved successfully!');
    setToastType('success');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentEmployee(null);
  };

  if (isLoading || loadingEmployees) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthenticated || (user && user.role !== 'admin')) {
    return null; // Atau tampilkan pesan akses ditolak
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Selamat datang, {user?.username}!</p>
      <p>Role Anda: {user?.role}</p>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee List</h2>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add New Employee
        </button>
      </div>

      {errorEmployees && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          {errorEmployees}
        </div>
      )}

      {employees.length === 0 && !loadingEmployees && !errorEmployees ? (
        <p>No employees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Email</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Position</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Active</th>
                <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <td className="py-2 px-4">{employee.name}</td>
                  <td className="py-2 px-4">{employee.email}</td>
                  <td className="py-2 px-4">{employee.position}</td>
                  <td className="py-2 px-4">{employee.is_active ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
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
        <EmployeeForm
          employee={currentEmployee}
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
