import express from 'express';
import { body, param } from 'express-validator';
import { createPrescription, listPrescriptions, getPrescription } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const medicineValidator = [
  body('medicines').isArray().withMessage('Medicines must be an array'),
  body('medicines.*.name').trim().notEmpty().withMessage('Medicine name required'),
  body('medicines.*.dosage').trim().notEmpty().withMessage('Dosage required'),
];

router
  .route('/')
  .get(protect, listPrescriptions)
  .post(
    protect,
    authorize('doctor'),
    [
      body('appointmentId').isMongoId().withMessage('Valid appointment ID required'),
      ...medicineValidator,
      body('remarks').optional().trim(),
    ],
    createPrescription
  );

router.get('/:id', protect, param('id').isMongoId(), getPrescription);

export default router;
