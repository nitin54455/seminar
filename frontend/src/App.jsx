import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Layout from './components/Layout';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const role = (user?.role || '').toLowerCase();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/patient" element={<PrivateRoute allowedRoles={['patient']}><Layout><PatientDashboard /></Layout></PrivateRoute>} />
      <Route path="/doctor" element={<PrivateRoute allowedRoles={['doctor']}><Layout><DoctorDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
