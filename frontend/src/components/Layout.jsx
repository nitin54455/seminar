import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashLink = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : '/patient';
  const title = user?.role === 'admin' ? 'Admin' : user?.role === 'doctor' ? 'Doctor' : 'Patient';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-4">
              <Link to={dashLink} className="text-lg font-semibold text-primary-600">
                Smart Appointment
              </Link>
              <span className="text-sm text-gray-500">{title} Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
