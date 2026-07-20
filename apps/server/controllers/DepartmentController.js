import Department from '../models/Department.js';
import { sendResponse } from '../helpers/response.js';

const DepartmentController = {
  index: async (req, res) => {
    const records = await Department.find().sort({ created_at: -1 });
    const formatted = records.map(r => ({ ...r.toObject(), department_id: r._id }));
    return sendResponse(res, true, 'Departments fetched successfully', formatted);
  },

  show: async (req, res) => {
    const { id } = req.params;
    const record = await Department.findById(id);
    if (!record) return sendResponse(res, false, 'Department not found', null, 404);
    const formatted = { ...record.toObject(), department_id: record._id };
    return sendResponse(res, true, 'Department fetched successfully', formatted);
  },

  store: async (req, res) => {
    const { department_name } = req.body;
    if (!department_name) {
      return sendResponse(res, false, 'Missing required field: department_name', null, 400);
    }
    const exists = await Department.findOne({ department_name });
    if (exists) return sendResponse(res, false, 'Department already exists', null, 409);
    await Department.create({ department_name });
    return sendResponse(res, true, 'Department created successfully', null, 201);
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { department_name } = req.body;
    const dept = await Department.findById(id);
    if (!dept) return sendResponse(res, false, 'Department not found', null, 404);
    if (department_name) {
      const exists = await Department.findOne({ department_name, _id: { $ne: id } });
      if (exists) return sendResponse(res, false, 'Department name already exists', null, 409);
      dept.department_name = department_name;
    }
    await dept.save();
    return sendResponse(res, true, 'Department updated successfully');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const dept = await Department.findById(id);
    if (!dept) return sendResponse(res, false, 'Department not found', null, 404);
    await dept.deleteOne();
    return sendResponse(res, true, 'Department deleted successfully');
  }
};

export default DepartmentController;