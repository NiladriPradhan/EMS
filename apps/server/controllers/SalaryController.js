import SalaryRecord from '../models/SalaryRecord.js';
import SalaryStructure from '../models/SalaryStructure.js';
import Employee from '../models/Employee.js';
import Role from '../models/Role.js';
import { sendResponse } from '../helpers/response.js';

const SalaryController = {
  generate: async (req, res) => {
    const { employee_id, salary_month, salary_year } = req.body;
    if (!employee_id || !salary_month || !salary_year) {
      return sendResponse(res, false, 'Employee, month and year are required', null, 400);
    }
    const exists = await SalaryRecord.findOne({ employee_id, salary_month, salary_year });
    if (exists) return sendResponse(res, false, 'Salary already generated for this month', null, 409);
    const structure = await SalaryStructure.findOne({ employee_id, status: 'Active' });
    if (!structure) return sendResponse(res, false, 'Active salary structure not found', null, 404);

    const grossSalary = structure.basic_salary + structure.hra + structure.da + structure.ta + structure.medical_allowance + structure.other_allowance;
    const totalDeductions = structure.pf + structure.esi + structure.professional_tax + structure.income_tax;
    const netSalary = grossSalary - totalDeductions;

    const salaryData = {
      employee_id,
      salary_month,
      salary_year,
      basic_salary: structure.basic_salary,
      hra: structure.hra,
      da: structure.da,
      ta: structure.ta,
      medical_allowance: structure.medical_allowance,
      other_allowance: structure.other_allowance,
      gross_salary: grossSalary,
      pf: structure.pf,
      esi: structure.esi,
      professional_tax: structure.professional_tax,
      income_tax: structure.income_tax,
      total_deductions: totalDeductions,
      net_salary: netSalary,
      generated_by: req.user.user_id
    };
    await SalaryRecord.create(salaryData);
    return sendResponse(res, true, 'Salary generated successfully', {
      gross_salary: grossSalary,
      total_deductions: totalDeductions,
      net_salary: netSalary
    });
  },

  index: async (req, res) => {
    const records = await SalaryRecord.find()
      .populate('employee_id', 'first_name last_name')
      .populate('generated_by', 'username');
    return sendResponse(res, true, 'Salary records fetched successfully', records);
  },

  show: async (req, res) => {
    const { id } = req.params;
    const record = await SalaryRecord.findById(id)
      .populate('employee_id')
      .populate('generated_by');
    if (!record) return sendResponse(res, false, 'Salary record not found', null, 404);
    return sendResponse(res, true, 'Salary record fetched successfully', record);
  },

  pay: async (req, res) => {
    const { id } = req.params;
    const record = await SalaryRecord.findById(id);
    if (!record) return sendResponse(res, false, 'Salary record not found', null, 404);
    if (record.payment_status === 'Paid') return sendResponse(res, false, 'Salary has already been paid', null, 409);
    record.payment_status = 'Paid';
    record.paid_date = new Date();
    await record.save();
    return sendResponse(res, true, 'Salary marked as paid');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const record = await SalaryRecord.findById(id);
    if (!record) return sendResponse(res, false, 'Salary record not found', null, 404);
    await record.deleteOne();
    return sendResponse(res, true, 'Salary record deleted successfully');
  },

  payslipIndex: async (req, res) => {
    const user = req.user;
    const role = await Role.findById(user.role_id);
    const canViewAll = role && role.permissions.includes('payroll.view');
    let records;
    if (canViewAll) {
      records = await SalaryRecord.find().populate('employee_id', 'first_name last_name');
    } else {
      const employee = await Employee.findOne({ user_id: user.user_id });
      if (!employee) records = [];
      else records = await SalaryRecord.find({ employee_id: employee._id });
    }
    return sendResponse(res, true, 'Payslips fetched successfully', records);
  },

  payslip: async (req, res) => {
    const { id } = req.params;
    const payslip = await SalaryRecord.findById(id)
      .populate('employee_id')
      .populate('generated_by');
    if (!payslip) return sendResponse(res, false, 'Payslip not found', null, 404);
    const user = req.user;
    const role = await Role.findById(user.role_id);
    const canViewAll = role && role.permissions.includes('payroll.view');
    if (!canViewAll) {
      const employee = await Employee.findOne({ user_id: user.user_id });
      if (!employee || employee._id.toString() !== payslip.employee_id._id.toString()) {
        return sendResponse(res, false, 'Forbidden: you can only view your own payslip', null, 403);
      }
    }
    return sendResponse(res, true, 'Payslip fetched successfully', payslip);
  }
};

export default SalaryController;