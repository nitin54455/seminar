import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import { validationResult } from 'express-validator';

/**
 * @route   GET /api/admin/overview
 * @desc    System overview (counts)
 */
export const getOverview = async (req, res, next) => {
  try {
    const [doctorsCount, patientsCount, appointmentsCount, prescriptionsCount] = await Promise.all([
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Prescription.countDocuments(),
    ]);
    res.json({
      success: true,
      data: { doctorsCount, patientsCount, appointmentsCount, prescriptionsCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/patients
 * @desc    List all patients
 */
export const listPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('name email createdAt').sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/appointments
 * @desc    List all appointments
 */
export const listAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .sort({ date: -1, time: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/admin/doctors
 * @desc    Add a doctor
 */
export const addDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { name, email, password, specialization } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }
    const doctor = await User.create({ name, email, password, role: 'doctor', specialization: specialization || '' });
    res.status(201).json({
      success: true,
      data: { _id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/doctors
 * @desc    List all doctors
 */
export const listDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email specialization createdAt').sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/admin/doctors/:id
 * @desc    Remove a doctor
 */
export const removeDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }
    await User.findByIdAndDelete(doctor._id);
    res.json({ success: true, message: 'Doctor removed' });
  } catch (err) {
    next(err);
  }
};
