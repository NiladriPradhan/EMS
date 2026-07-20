import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  date_of_birth: { type: Date },
  hire_date: { type: Date },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Employee', EmployeeSchema);