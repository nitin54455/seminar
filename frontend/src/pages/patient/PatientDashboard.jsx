import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [bookForm, setBookForm] = useState({ doctorId: '', date: '', time: '' });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);

  const fetchDoctors = () => api.get('/appointments/doctors').then((r) => setDoctors(r.data.data));
  const fetchAppointments = () => api.get('/appointments').then((r) => setAppointments(r.data.data));
  const fetchPrescriptions = () => api.get('/prescriptions').then((r) => setPrescriptions(r.data.data));

  useEffect(() => {
    Promise.all([fetchDoctors(), fetchAppointments(), fetchPrescriptions()]).finally(() => setLoading(false));
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess(false);
    try {
      await api.post('/appointments', bookForm);
      setBookForm({ doctorId: '', date: '', time: '' });
      setBookSuccess(true);
      fetchAppointments();
    } catch (err) {
      setBookError(err.response?.data?.message || 'Failed to book');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const statusColor = (s) => (s === 'approved' ? 'bg-green-100 text-green-800' : s === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800');

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const tabs = [
    { id: 'appointments', label: 'My Appointments' },
    { id: 'book', label: 'Book Appointment' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'history', label: 'Medical History' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Dashboard</h1>

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

      {activeTab === 'book' && (
        <div className="bg-white rounded-xl shadow p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-4">Book an Appointment</h2>
          {bookSuccess && <p className="text-green-600 text-sm mb-2">Appointment requested successfully.</p>}
          {bookError && <p className="text-red-600 text-sm mb-2">{bookError}</p>}
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                value={bookForm.doctorId}
                onChange={(e) => setBookForm((f) => ({ ...f, doctorId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} – {d.specialization || 'General'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm((f) => ({ ...f, date: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm((f) => ({ ...f, time: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
              Request Appointment
            </button>
          </form>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">My Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No appointments yet.</td></tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a._id} className="bg-white">
                      <td className="px-4 py-3 text-sm text-gray-900">{a.doctorId?.name} ({a.doctorId?.specialization || 'General'})</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(a.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.time}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded ${statusColor(a.status)}`}>{a.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <p className="text-gray-500">No prescriptions yet.</p>
          ) : (
            prescriptions.map((p) => (
              <div key={p._id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-500">{p.appointmentId?.doctorId?.name} • {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {p.medicines?.map((m, i) => (
                    <li key={i}><strong>{m.name}</strong> – {m.dosage} {m.duration ? `(${m.duration})` : ''}</li>
                  ))}
                </ul>
                {p.remarks && <p className="mt-2 text-sm text-gray-600 italic">{p.remarks}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Medical History</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <h3 className="p-4 border-b font-medium">Appointments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((a) => (
                    <tr key={a._id}><td className="px-4 py-3 text-sm">{a.doctorId?.name}</td><td className="px-4 py-3 text-sm">{formatDate(a.date)} {a.time}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded ${statusColor(a.status)}`}>{a.status}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-medium mb-3">Prescriptions Summary</h3>
            <p className="text-sm text-gray-600">Total prescriptions: {prescriptions.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
