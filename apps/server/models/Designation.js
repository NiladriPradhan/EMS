import mongoose from 'mongoose';

const DesignationSchema = new mongoose.Schema({
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  designation_name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

DesignationSchema.index({ department_id: 1, designation_name: 1 }, { unique: true });

export default mongoose.model('Designation', DesignationSchema);