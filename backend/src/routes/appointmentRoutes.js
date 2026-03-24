import express from 'express';
import { body, param } from 'express-validator';
import { bookAppointment, listAppointments, updateAppointmentStatus, listDoctors } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/doctors', protect, listDoctors);

router
  .route('/')
  .get(protect, listAppointments)
  .post(
    protect,
    authorize('patient'),
    [
      body('doctorId').isMongoId().withMessage('Valid doctor ID required'),
      body('date').isISO8601().withMessage('Valid date required (YYYY-MM-DD)'),
      body('time').trim().notEmpty().withMessage('Time is required'),
    ],
    bookAppointment
  );

router.patch(
  '/:id/status',
  protect,
  authorize('doctor'),
  [
    param('id').isMongoId().withMessage('Valid appointment ID required'),
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  ],
  updateAppointmentStatus
);

export default router;
