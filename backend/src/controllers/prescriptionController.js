import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { validationResult } from 'express-validator';

/**
 * @route   POST /api/prescriptions
 * @desc    Doctor creates prescription for an approved appointment
 */
export const createPrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map((e) => e.msg).join(', '));
    }
    const { appointmentId, medicines, remarks } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('This appointment is not assigned to you');
    }
    if (appointment.status !== 'approved') {
      res.status(400);
      throw new Error('Can only create prescription for approved appointments');
    }
    const existing = await Prescription.findOne({ appointmentId });
    if (existing) {
      res.status(400);
      throw new Error('Prescription already exists for this appointment');
    }
    const prescription = await Prescription.create({ appointmentId, medicines: medicines || [], remarks: remarks || '' });
    await prescription.populate({
      path: 'appointmentId',
      populate: [{ path: 'patientId', select: 'name email' }, { path: 'doctorId', select: 'name specialization' }],
    });
    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/prescriptions
 * @desc    List prescriptions (patient: own, doctor: created by me)
 */
export const listPrescriptions = async (req, res, next) => {
  try {
    let appointmentQuery = {};
    if (req.user.role === 'patient') {
      appointmentQuery.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      appointmentQuery.doctorId = req.user._id;
      if (req.query.patientId) appointmentQuery.patientId = req.query.patientId; // view specific patient's prescriptions
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const appointments = await Appointment.find(appointmentQuery).select('_id');
    const appointmentIds = appointments.map((a) => a._id);
    const prescriptions = await Prescription.find({ appointmentId: { $in: appointmentIds } })
      .populate({
        path: 'appointmentId',
        populate: [{ path: 'patientId', select: 'name email' }, { path: 'doctorId', select: 'name specialization' }],
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get single prescription (patient/doctor who owns it)
 */
export const getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate({
      path: 'appointmentId',
      populate: [{ path: 'patientId', select: 'name email' }, { path: 'doctorId', select: 'name email specialization' }],
    });
    if (!prescription) {
      res.status(404);
      throw new Error('Prescription not found');
    }
    const app = prescription.appointmentId;
    if (req.user.role === 'patient' && app.patientId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this prescription');
    }
    if (req.user.role === 'doctor' && app.doctorId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this prescription');
    }
    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};
