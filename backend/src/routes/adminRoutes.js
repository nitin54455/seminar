import express from 'express';
import { body, param } from 'express-validator';
import {
  getOverview,
  listPatients,
  listAllAppointments,
  addDoctor,
  listDoctors,
  removeDoctor,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/patients', listPatients);
router.get('/appointments', listAllAppointments);

router
  .route('/doctors')
  .get(listDoctors)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('specialization').optional().trim(),
    ],
    addDoctor
  );

router.delete('/doctors/:id', param('id').isMongoId(), removeDoctor);

export default router;
