import SalaryStructure from '../models/SalaryStructure.js';
import { sendResponse } from '../helpers/response.js';

const SalaryStructureController = {
  index: async (req, res) => {
    const structures = await SalaryStructure.find().populate('employee_id', 'first_name last_name');
    return sendResponse(res, true, 'Salary structures fetched successfully', structures);
  },

  show: async (req, res) => {
    const { id } = req.params;
    const structure = await SalaryStructure.findById(id).populate('employee_id');
    if (!structure) return sendResponse(res, false, 'Salary structure not found', null, 404);
    return sendResponse(res, true, 'Salary structure fetched successfully', structure);
  },

  store: async (req, res) => {
    const data = req.body;
    const required = ['employee_id', 'basic_salary', 'hra', 'da', 'ta', 'medical_allowance', 'other_allowance', 'pf', 'esi', 'professional_tax', 'income_tax', 'status'];
    for (const field of required) {
      if (data[field] === undefined) {
        return sendResponse(res, false, `Missing required field: ${field}`, null, 400);
      }
    }
    const exists = await SalaryStructure.findOne({ employee_id: data.employee_id });
    if (exists) return sendResponse(res, false, 'This employee already has a salary structure', null, 409);
    await SalaryStructure.create(data);
    return sendResponse(res, true, 'Salary structure created successfully', null, 201);
  },

  update: async (req, res) => {
    const { id } = req.params;
    const structure = await SalaryStructure.findById(id);
    if (!structure) return sendResponse(res, false, 'Salary structure not found', null, 404);
    Object.assign(structure, req.body);
    await structure.save();
    return sendResponse(res, true, 'Salary structure updated successfully');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const structure = await SalaryStructure.findById(id);
    if (!structure) return sendResponse(res, false, 'Salary structure not found', null, 404);
    await structure.deleteOne();
    return sendResponse(res, true, 'Salary structure deleted successfully');
  }
};

export default SalaryStructureController;