import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  attendance_date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  check_in: String,
  check_out: String,
  created_at: { type: Date, default: Date.now }
});

AttendanceSchema.index({ employee_id: 1, attendance_date: 1 }, { unique: true });

export default mongoose.model('Attendance', AttendanceSchema);