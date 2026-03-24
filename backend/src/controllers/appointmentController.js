import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @route   POST /api/appointments
 * @desc    Patient books an appointment (patient only)
 */
export const bookAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { doctorId, date, time } = req.body;
    const patientId = req.user._id;
    const existing = await Appointment.findOne({ doctorId, date: new Date(date), time, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      res.status(400);
      throw new Error('This slot is already booked');
    }
    const appointment = await Appointment.create({ patientId, doctorId, date: new Date(date), time, status: 'pending' });
    await appointment.populate([{ path: 'doctorId', select: 'name email specialization' }, { path: 'patientId', select: 'name email' }]);
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/appointments
 * @desc    List appointments (filtered by role: patient sees own, doctor sees assigned, admin sees all via /api/admin)
 */
export const listAppointments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patientId = req.user._id;
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
      if (req.query.patientId) query.patientId = req.query.patientId; // view specific patient's appointments
    }
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Doctor approves or rejects appointment
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { status } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.user._id });
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found or not assigned to you');
    }
    if (appointment.status !== 'pending') {
      res.status(400);
      throw new Error('Appointment is already processed');
    }
    appointment.status = status;
    await appointment.save();
    await appointment.populate([{ path: 'doctorId', select: 'name email specialization' }, { path: 'patientId', select: 'name email' }]);
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/appointments/doctors
 * @desc    List doctors (for patient to select when booking)
 */
export const listDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email specialization').sort('name');
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};
