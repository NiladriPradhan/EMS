import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { sendResponse } from '../helpers/response.js';

const AttendanceController = {
  index: async (req, res) => {
    try {
      const records = await Attendance.find().populate('employee_id', 'first_name last_name');
      const formatted = records.map(r => ({
        ...r.toObject(),
        attendance_id: r._id,
        employee_id: r.employee_id?._id || r.employee_id,
        employee_name: r.employee_id ? `${r.employee_id.first_name} ${r.employee_id.last_name}` : ''
      }));
      return sendResponse(res, true, 'Attendance list', formatted);
    } catch (err) {
      return sendResponse(res, false, 'Failed to fetch attendance', null, 500);
    }
  },

  store: async (req, res) => {
    const { employee_id, attendance_date, status, check_in, check_out } = req.body;
    if (!employee_id || !attendance_date) {
      return sendResponse(res, false, 'Missing required fields: employee_id, attendance_date', null, 422);
    }
    const allowed = ['Present', 'Absent', 'Late'];
    if (status && !allowed.includes(status)) {
      return sendResponse(res, false, 'Invalid status value', null, 422);
    }
    try {
      const employee = await Employee.findById(employee_id);
      if (!employee) return sendResponse(res, false, 'Employee not found', null, 404);
      const existing = await Attendance.findOne({ employee_id, attendance_date: new Date(attendance_date) });
      if (existing) return sendResponse(res, false, 'Attendance already recorded for this date', null, 409);
      const record = await Attendance.create({
        employee_id,
        attendance_date: new Date(attendance_date),
        status: status || 'Present',
        check_in,
        check_out
      });
      return sendResponse(res, true, 'Attendance recorded', record, 201);
    } catch (err) {
      return sendResponse(res, false, 'Failed to record attendance', null, 500);
    }
  }
};

export default AttendanceController;