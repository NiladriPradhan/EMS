import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { sendResponse } from '../helpers/response.js';

const mapEmployee = (emp) => ({
  employee_id: emp._id,
  user_id: emp.user_id?._id,
  username: emp.user_id?.username,
  email: emp.user_id?.email,
  status: emp.user_id?.status,
  role_id: emp.user_id?.role_id?.role_name || emp.user_id?.role_id,
  first_name: emp.first_name,
  last_name: emp.last_name,
  phone: emp.phone,
  address: emp.address,
  date_of_birth: emp.date_of_birth,
  hire_date: emp.hire_date,
  department_id: emp.department_id?._id || emp.department_id,
  department_name: emp.department_id?.department_name,
  designation_id: emp.designation_id?._id || emp.designation_id,
  designation_name: emp.designation_id?.designation_name,
});

const getRoleId = async (roleString) => {
  if (!roleString) return null;
  // If it's already an ObjectId, findById will work, otherwise find by name
  if (roleString === 1 || String(roleString) === "1") roleString = "Admin";
  if (roleString === 2 || String(roleString) === "2") roleString = "HR";
  if (roleString === 3 || String(roleString) === "3") roleString = "Employee";
  
  const role = await Role.findOne({ role_name: roleString });
  return role ? role._id : roleString;
};

const EmployeeController = {
  index: async (req, res) => {
    try {
      const employees = await Employee.find()
        .populate({
          path: 'user_id',
          select: 'username email status role_id',
          populate: { path: 'role_id', select: 'role_name' }
        })
        .populate('department_id', 'department_name')
        .populate('designation_id', 'designation_name');
      const formatted = employees.map(mapEmployee);
      return sendResponse(res, true, 'Employee list', formatted);
    } catch (err) {
      return sendResponse(res, false, 'Failed to fetch employees', null, 500);
    }
  },

  store: async (req, res) => {
    const { username, email, password, first_name, last_name, department_id, designation_id, phone, address, date_of_birth, hire_date, role_id } = req.body;
    if (!username || !email || !password || !first_name || !last_name) {
      return sendResponse(res, false, 'Missing required fields', null, 422);
    }
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return sendResponse(res, false, 'Email or username already exists', null, 409);
      }
      
      const actualRoleId = await getRoleId(role_id);
      
      const user = await User.create({
        username,
        email,
        password,
        role_id: actualRoleId || null,
        status: 'Active'
      });
      const employee = await Employee.create({
        user_id: user._id,
        first_name,
        last_name,
        department_id: department_id || null,
        designation_id: designation_id || null,
        phone: phone || null,
        address: address || null,
        date_of_birth: date_of_birth || null,
        hire_date: hire_date || null
      });
      
      const populated = await Employee.findById(employee._id)
        .populate({
          path: 'user_id',
          select: 'username email status role_id',
          populate: { path: 'role_id', select: 'role_name' }
        });
      
      return sendResponse(res, true, 'Employee created', mapEmployee(populated), 201);
    } catch (err) {
      console.error(err);
      return sendResponse(res, false, 'Failed to create employee', null, 500);
    }
  },

  show: async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id)
      .populate({
        path: 'user_id',
        select: 'username email status role_id',
        populate: { path: 'role_id', select: 'role_name' }
      })
      .populate('department_id', 'department_name')
      .populate('designation_id', 'designation_name');
    if (!employee) return sendResponse(res, false, 'Employee not found', null, 404);
    return sendResponse(res, true, 'Employee details', mapEmployee(employee));
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const employee = await Employee.findById(id).populate('user_id');
    if (!employee) return sendResponse(res, false, 'Employee not found', null, 404);
    
    // Clean up empty string values for ObjectIds and Dates
    ['department_id', 'designation_id', 'date_of_birth', 'hire_date'].forEach(key => {
      if (updateData[key] === "") updateData[key] = null;
    });

    // Update employee fields
    Object.assign(employee, updateData);
    await employee.save();
    
    // Update user fields if provided
    if (updateData.email || updateData.username || updateData.role_id || updateData.status || updateData.password) {
      const user = await User.findById(employee.user_id._id);
      if (user) {
        if (updateData.email) user.email = updateData.email;
        if (updateData.username) user.username = updateData.username;
        if (updateData.status) user.status = updateData.status;
        if (updateData.password) user.password = updateData.password;
        if (updateData.role_id) {
          user.role_id = await getRoleId(updateData.role_id) || user.role_id;
        }
        await user.save();
      }
    }
    
    return sendResponse(res, true, 'Employee updated successfully');
  },

  destroy: async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return sendResponse(res, false, 'Employee not found', null, 404);
    await employee.deleteOne();
    await User.findByIdAndDelete(employee.user_id);
    return sendResponse(res, true, 'Employee deleted successfully');
  }
};

export default EmployeeController;