import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Designation from '../models/Designation.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import { sendResponse } from '../helpers/response.js';

const DashboardController = {
  index: async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalDesignations = await Designation.countDocuments();
    const todayAttendance = await Attendance.countDocuments({
      attendance_date: { $gte: today, $lt: tomorrow }
    });
    const presentToday = await Attendance.countDocuments({
      attendance_date: { $gte: today, $lt: tomorrow },
      status: 'Present'
    });
    const absentToday = await Attendance.countDocuments({
      attendance_date: { $gte: today, $lt: tomorrow },
      status: 'Absent'
    });
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

    const data = {
      total_employees: totalEmployees,
      total_departments: totalDepartments,
      total_designations: totalDesignations,
      today_attendance: todayAttendance,
      present_today: presentToday,
      absent_today: absentToday,
      pending_leaves: pendingLeaves,
      approved_leaves: approvedLeaves,
      rejected_leaves: rejectedLeaves
    };
    return sendResponse(res, true, 'Dashboard fetched successfully', data);
  }
};

export default DashboardController;