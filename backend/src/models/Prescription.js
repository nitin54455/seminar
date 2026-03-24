import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg twice daily"
  duration: { type: String, default: '' }, // e.g. "7 days"
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    medicines: [medicineSchema],
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
