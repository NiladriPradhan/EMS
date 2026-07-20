import mongoose from 'mongoose';

const SalaryRecordSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  salary_month: { type: Number, required: true },
  salary_year: { type: Number, required: true },
  basic_salary: Number,
  hra: Number,
  da: Number,
  ta: Number,
  medical_allowance: Number,
  other_allowance: Number,
  gross_salary: Number,
  pf: Number,
  esi: Number,
  professional_tax: Number,
  income_tax: Number,
  total_deductions: Number,
  net_salary: Number,
  payment_status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generated_date: { type: Date, default: Date.now },
  paid_date: Date
});

SalaryRecordSchema.index({ employee_id: 1, salary_month: 1, salary_year: 1 }, { unique: true });

export default mongoose.model('SalaryRecord', SalaryRecordSchema);