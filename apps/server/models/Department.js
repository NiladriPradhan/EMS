import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Department', DepartmentSchema);