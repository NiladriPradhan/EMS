import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Role from '../models/Role.js';
import { sendResponse } from '../helpers/response.js';

const hasPermission = async (roleId, permission) => {
  const role = await Role.findById(roleId);
  return role && role.permissions.includes(permission);
};

const LeaveController = {
  index: async (req, res) => {
    const user = req.user;
    const canViewAll = await hasPermission(user.role_id, 'leave.approve');
    let records;
    if (canViewAll) {
      records = await Leave.find().populate('employee_id', 'first_name last_name');
    } else {
      const employee = await Employee.findOne({ user_id: user.user_id });
      if (!employee) records = [];
      else records = await Leave.find({ employee_id: employee._id }).populate('employee_id', 'first_name last_name');
    }
    const formatted = records.map(r => ({
      ...r.toObject(),
      leave_id: r._id,
      employee_id: r.employee_id?._id || r.employee_id,
      employee_name: r.employee_id ? `${r.employee_id.first_name} ${r.employee_id.last_name}` : ''
    }));
    return sendResponse(res, true, 'Leaves fetched successfully', formatted);
  },

  show: async (req, res) => {
    const { id } = req.params;
    const record = await Leave.findById(id).populate('employee_id', 'first_name last_name');
    if (!record) return sendResponse(res, false, 'Leave not found', null, 404);
    const formatted = {
      ...record.toObject(),
      leave_id: record._id,
      employee_id: record.employee_id?._id || record.employee_id,
      employee_name: record.employee_id ? `${record.employee_id.first_name} ${record.employee_id.last_name}` : ''
    };
    return sendResponse(res, true, 'Leave fetched successfully', formatted);
  },

  employeeLeaves: async (req, res) => {
    const { employee_id } = req.params;
    const records = await Leave.find({ employee_id }).populate('employee_id', 'first_name last_name');
    const formatted = records.map(r => ({
      ...r.toObject(),
      leave_id: r._id,
      employee_id: r.employee_id?._id || r.employee_id,
      employee_name: r.employee_id ? `${r.employee_id.first_name} ${r.employee_id.last_name}` : ''
    }));
    return sendResponse(res, true, 'Employee leaves fetched successfully', formatted);
  },

  pending: async (req, res) => {
    const records = await Leave.find({ status: 'Pending' }).populate('employee_id', 'first_name last_name');
    const formatted = records.map(r => ({
      ...r.toObject(),
      leave_id: r._id,
      employee_id: r.employee_id?._id || r.employee_id,
      employee_name: r.employee_id ? `${r.employee_id.first_name} ${r.employee_id.last_name}` : ''
    }));
    return sendResponse(res, true, 'Pending leave requests fetched successfully', formatted);
  },

  store: async (req, res) => {
    let { employee_id, leave_type, start_date, end_date, total_days, reason } = req.body;
    if (!leave_type || !start_date || !end_date) {
      return sendResponse(res, false, 'Missing required fields: leave_type, start_date, end_date', null, 400);
    }
    const user = req.user;
    if (!employee_id) {
      const emp = await Employee.findOne({ user_id: user.user_id });
      if (!emp) return sendResponse(res, false, 'Employee profile not found', null, 404);
      employee_id = emp._id;
    }
    if (!total_days) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
      total_days = Math.ceil(diff);
    }
    const existing = await Leave.findOne({
      employee_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date)
    });
    if (existing) {
      return sendResponse(res, false, 'Leave request already exists for selected dates', null, 409);
    }
    await Leave.create({
      employee_id,
      leave_type,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      total_days,
      reason,
      status: 'Pending'
    });
    return sendResponse(res, true, 'Leave request submitted successfully', null, 201);
  },

  update: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    Object.assign(leave, req.body);
    await leave.save();
    return sendResponse(res, true, 'Leave updated successfully');
  },

  approve: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    if (leave.status !== 'Pending') return sendResponse(res, false, 'Only pending leaves can be approved', null, 400);
    leave.status = 'Approved';
    leave.approved_by = req.user.user_id;
    leave.approved_date = new Date();
    await leave.save();
    return sendResponse(res, true, 'Leave approved successfully');
  },

  reject: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    if (leave.status !== 'Pending') return sendResponse(res, false, 'Only pending leaves can be rejected', null, 400);
    leave.status = 'Rejected';
    leave.approved_by = req.user.user_id;
    leave.approved_date = new Date();
    await leave.save();
    return sendResponse(res, true, 'Leave rejected successfully');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    await leave.deleteOne();
    return sendResponse(res, true, 'Leave deleted successfully');
  },

  cancel: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    if (leave.status !== 'Pending') return sendResponse(res, false, 'Only pending leaves can be cancelled', null, 400);
    const user = req.user;
    const canManageAll = await hasPermission(user.role_id, 'leave.approve');
    if (!canManageAll) {
      const emp = await Employee.findOne({ user_id: user.user_id });
      if (!emp || emp._id.toString() !== leave.employee_id.toString()) {
        return sendResponse(res, false, 'Forbidden: you can only cancel your own leave requests', null, 403);
      }
    }
    leave.status = 'Cancelled';
    await leave.save();
    return sendResponse(res, true, 'Leave cancelled successfully');
  },

  reopen: async (req, res) => {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return sendResponse(res, false, 'Leave not found', null, 404);
    if (!['Cancelled', 'Rejected'].includes(leave.status)) {
      return sendResponse(res, false, 'Only Cancelled or Rejected leaves can be re-requested', null, 400);
    }
    const user = req.user;
    const canManageAll = await hasPermission(user.role_id, 'leave.approve');
    if (!canManageAll) {
      const emp = await Employee.findOne({ user_id: user.user_id });
      if (!emp || emp._id.toString() !== leave.employee_id.toString()) {
        return sendResponse(res, false, 'Forbidden: you can only re-request your own leave', null, 403);
      }
    }
    const { leave_type, start_date, end_date, reason } = req.body;
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
      leave.total_days = Math.ceil(diff);
      leave.start_date = start;
      leave.end_date = end;
    }
    if (leave_type) leave.leave_type = leave_type;
    if (reason) leave.reason = reason;
    leave.status = 'Pending';
    leave.approved_by = null;
    leave.approved_date = null;
    await leave.save();
    return sendResponse(res, true, 'Leave re-requested successfully');
  }
};

export default LeaveController;