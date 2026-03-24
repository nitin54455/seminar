import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', specialization: '' });
  const [doctorError, setDoctorError] = useState('');
  const [doctorSuccess, setDoctorSuccess] = useState(false);

  const fetchOverview = () => api.get('/admin/overview').then((r) => setOverview(r.data.data));
  const fetchPatients = () => api.get('/admin/patients').then((r) => setPatients(r.data.data));
  const fetchDoctors = () => api.get('/admin/doctors').then((r) => setDoctors(r.data.data));
  const fetchAppointments = () => api.get('/admin/appointments').then((r) => setAppointments(r.data.data));

  useEffect(() => {
    Promise.all([fetchOverview(), fetchPatients(), fetchDoctors(), fetchAppointments()]).finally(() => setLoading(false));
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDoctorError('');
    setDoctorSuccess(false);
    try {
      await api.post('/admin/doctors', doctorForm);
      setDoctorForm({ name: '', email: '', password: '', specialization: '' });
      setDoctorSuccess(true);
      fetchDoctors();
      fetchOverview();
    } catch (err) {
      setDoctorError(err.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleRemoveDoctor = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchDoctors();
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Appointments' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === t.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-primary-500">
            <p className="text-sm text-gray-500">Doctors</p>
            <p className="text-3xl font-bold text-gray-800">{overview.doctorsCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Patients</p>
            <p className="text-3xl font-bold text-gray-800">{overview.patientsCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Appointments</p>
            <p className="text-3xl font-bold text-gray-800">{overview.appointmentsCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Prescriptions</p>
            <p className="text-3xl font-bold text-gray-800">{overview.prescriptionsCount}</p>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Doctor</h2>
            {doctorSuccess && <p className="text-green-600 text-sm mb-2">Doctor added successfully.</p>}
            {doctorError && <p className="text-red-600 text-sm mb-2">{doctorError}</p>}
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <input type="text" placeholder="Name" value={doctorForm.name} onChange={(e) => setDoctorForm((f) => ({ ...f, name: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg" />
              <input type="email" placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm((f) => ({ ...f, email: e.target.value }))} required className="w-full px-3 py-2 border rounded-lg" />
              <input type="password" placeholder="Password (min 6)" value={doctorForm.password} onChange={(e) => setDoctorForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm((f) => ({ ...f, specialization: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
              <button type="submit" className="w-full py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">Add Doctor</button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b">All Doctors</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map((d) => (
                    <tr key={d._id}>
                      <td className="px-4 py-3 text-sm">{d.name}</td>
                      <td className="px-4 py-3 text-sm">{d.email}</td>
                      <td className="px-4 py-3 text-sm">{d.specialization || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleRemoveDoctor(d._id)} className="text-red-600 text-sm font-medium hover:underline">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">All Patients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-sm">{p.email}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">All Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td className="px-4 py-3 text-sm">{a.patientId?.name}</td>
                    <td className="px-4 py-3 text-sm">{a.doctorId?.name} ({a.doctorId?.specialization || '-'})</td>
                    <td className="px-4 py-3 text-sm">{formatDate(a.date)}</td>
                    <td className="px-4 py-3 text-sm">{a.time}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded ${a.status === 'approved' ? 'bg-green-100 text-green-800' : a.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
