import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [prescriptionForm, setPrescriptionForm] = useState({ appointmentId: '', medicines: [{ name: '', dosage: '', duration: '' }], remarks: '' });
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState({ appointments: [], prescriptions: [] });

  const fetchAppointments = () => api.get('/appointments').then((r) => setAppointments(r.data.data));
  const fetchPrescriptions = () => api.get('/prescriptions').then((r) => setPrescriptions(r.data.data));

  useEffect(() => {
    Promise.all([fetchAppointments(), fetchPrescriptions()]).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const addMedicineRow = () => setPrescriptionForm((f) => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', duration: '' }] }));
  const updateMedicine = (index, field, value) => {
    setPrescriptionForm((f) => ({
      ...f,
      medicines: f.medicines.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };
  const removeMedicine = (index) => {
    setPrescriptionForm((f) => ({ ...f, medicines: f.medicines.filter((_, i) => i !== index) }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setPrescriptionError('');
    setPrescriptionSuccess(false);
    const validMedicines = prescriptionForm.medicines.filter((m) => m.name.trim() && m.dosage.trim());
    if (validMedicines.length === 0) {
      setPrescriptionError('Add at least one medicine with name and dosage.');
      return;
    }
    try {
      await api.post('/prescriptions', {
        appointmentId: prescriptionForm.appointmentId,
        medicines: validMedicines,
        remarks: prescriptionForm.remarks,
      });
      setPrescriptionForm({ appointmentId: '', medicines: [{ name: '', dosage: '', duration: '' }], remarks: '' });
      setPrescriptionSuccess(true);
      fetchPrescriptions();
    } catch (err) {
      setPrescriptionError(err.response?.data?.message || 'Failed to create prescription');
    }
  };

  const loadPatientHistory = async (patientId) => {
    setSelectedPatientId(patientId);
    try {
      const [aptRes, presRes] = await Promise.all([
        api.get(`/appointments?patientId=${patientId}`),
        api.get(`/prescriptions?patientId=${patientId}`),
      ]);
      setPatientHistory({ appointments: aptRes.data.data, prescriptions: presRes.data.data });
    } catch (_) {
      setPatientHistory({ appointments: [], prescriptions: [] });
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => new Date(a.date).toISOString().split('T')[0] === today);
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const approvedForPrescription = appointments.filter((a) => a.status === 'approved');

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const tabs = [
    { id: 'schedule', label: 'Daily Schedule' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'prescription', label: 'Create Prescription' },
    { id: 'history', label: 'Patient History' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-primary-500">
          <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
          <p className="text-2xl font-bold text-gray-800">{todayAppointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-800">{pendingAppointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Prescriptions</p>
          <p className="text-2xl font-bold text-gray-800">{prescriptions.length}</p>
        </div>
      </div>

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

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">All Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No appointments.</td></tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a._id}>
                      <td className="px-4 py-3 text-sm">{a.patientId?.name}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(a.date)}</td>
                      <td className="px-4 py-3 text-sm">{a.time}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${a.status === 'approved' ? 'bg-green-100 text-green-800' : a.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">Approve / Reject</h2>
          <div className="divide-y divide-gray-200">
            {pendingAppointments.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No pending requests.</p>
            ) : (
              pendingAppointments.map((a) => (
                <div key={a._id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{a.patientId?.name}</span>
                    <span className="text-gray-500 text-sm ml-2">{formatDate(a.date)} {a.time}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(a._id, 'approved')} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Approve</button>
                    <button onClick={() => updateStatus(a._id, 'rejected')} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'prescription' && (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Create Prescription</h2>
          {prescriptionSuccess && <p className="text-green-600 text-sm mb-2">Prescription created.</p>}
          {prescriptionError && <p className="text-red-600 text-sm mb-2">{prescriptionError}</p>}
          <form onSubmit={handleCreatePrescription} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved Appointment</label>
              <select
                value={prescriptionForm.appointmentId}
                onChange={(e) => setPrescriptionForm((f) => ({ ...f, appointmentId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select appointment</option>
                {approvedForPrescription.map((a) => (
                  <option key={a._id} value={a._id}>{a.patientId?.name} – {formatDate(a.date)} {a.time}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Medicines</label>
                <button type="button" onClick={addMedicineRow} className="text-sm text-primary-600">+ Add</button>
              </div>
              {prescriptionForm.medicines.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <input placeholder="Medicine name" value={m.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                  <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                  <input placeholder="Duration" value={m.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} className="w-24 px-3 py-2 border rounded-lg text-sm" />
                  <button type="button" onClick={() => removeMedicine(i)} className="text-red-600 text-sm">Remove</button>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={prescriptionForm.remarks} onChange={(e) => setPrescriptionForm((f) => ({ ...f, remarks: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} />
            </div>
            <button type="submit" className="w-full py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">Create Prescription</button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">View Patient Medical History</h2>
          <p className="text-sm text-gray-600">Select a patient from your appointments to view their history.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[...new Set(appointments.map((a) => a.patientId?._id).filter(Boolean))].map((pid) => {
              const apt = appointments.find((a) => a.patientId?._id === pid);
              return (
                <button
                  key={pid}
                  onClick={() => loadPatientHistory(pid)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedPatientId === pid ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {apt?.patientId?.name}
                </button>
              );
            })}
          </div>
          {selectedPatientId && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-3">Appointments</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {patientHistory.appointments.map((a) => (
                  <li key={a._id}>{formatDate(a.date)} {a.time} – {a.status}</li>
                ))}
              </ul>
              <h3 className="font-semibold mt-4 mb-3">Prescriptions</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {patientHistory.prescriptions.map((p) => (
                  <li key={p._id}>{new Date(p.createdAt).toLocaleDateString()} – {p.medicines?.length} medicine(s)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
