import Designation from '../models/Designation.js';
import Department from '../models/Department.js';
import { sendResponse } from '../helpers/response.js';

const DesignationController = {
  index: async (req, res) => {
    const records = await Designation.find().populate('department_id', 'department_name');
    const formatted = records.map(r => ({
      ...r.toObject(),
      designation_id: r._id,
      department_id: r.department_id?._id || r.department_id,
      department_name: r.department_id?.department_name
    }));
    return sendResponse(res, true, 'Designations fetched successfully', formatted);
  },

  show: async (req, res) => {
    const { id } = req.params;
    const record = await Designation.findById(id).populate('department_id');
    if (!record) return sendResponse(res, false, 'Designation not found', null, 404);
    const formatted = {
      ...record.toObject(),
      designation_id: record._id,
      department_id: record.department_id?._id || record.department_id,
      department_name: record.department_id?.department_name
    };
    return sendResponse(res, true, 'Designation fetched successfully', formatted);
  },

  store: async (req, res) => {
    const { department_id, designation_name } = req.body;
    if (!department_id || !designation_name) {
      return sendResponse(res, false, 'Missing required fields: department_id, designation_name', null, 400);
    }
    const dept = await Department.findById(department_id);
    if (!dept) return sendResponse(res, false, 'Department not found', null, 404);
    const exists = await Designation.findOne({ department_id, designation_name });
    if (exists) return sendResponse(res, false, 'Designation already exists in this department', null, 409);
    await Designation.create({ department_id, designation_name });
    return sendResponse(res, true, 'Designation created successfully', null, 201);
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { department_id, designation_name } = req.body;
    const desig = await Designation.findById(id);
    if (!desig) return sendResponse(res, false, 'Designation not found', null, 404);
    if (designation_name) {
      const exists = await Designation.findOne({
        department_id: department_id || desig.department_id,
        designation_name,
        _id: { $ne: id }
      });
      if (exists) return sendResponse(res, false, 'Designation already exists in this department', null, 409);
      desig.designation_name = designation_name;
    }
    if (department_id) {
      const dept = await Department.findById(department_id);
      if (!dept) return sendResponse(res, false, 'Department not found', null, 404);
      desig.department_id = department_id;
    }
    await desig.save();
    return sendResponse(res, true, 'Designation updated successfully');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const desig = await Designation.findById(id);
    if (!desig) return sendResponse(res, false, 'Designation not found', null, 404);
    await desig.deleteOne();
    return sendResponse(res, true, 'Designation deleted successfully');
  }
};

export default DesignationController;