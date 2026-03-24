import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "09:00", "14:30"
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound index to avoid double-booking same doctor at same date/time
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
