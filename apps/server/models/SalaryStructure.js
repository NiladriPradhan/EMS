import mongoose from 'mongoose';

const SalaryStructureSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  basic_salary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  ta: { type: Number, default: 0 },
  medical_allowance: { type: Number, default: 0 },
  other_allowance: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  esi: { type: Number, default: 0 },
  professional_tax: { type: Number, default: 0 },
  income_tax: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('SalaryStructure', SalaryStructureSchema);