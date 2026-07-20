import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';
import Role from './models/Role.js';  // adjust path if needed

const adminHrPermissions = [
  "dashboard.view", 
  "employee.view", "employee.create", "employee.update", "employee.delete",
  "department.view", "department.create", "department.update", "department.delete",
  "designation.view", "designation.create", "designation.update", "designation.delete",
  "attendance.view", "attendance.create", "attendance.update", "attendance.delete",
  "leave.view", "leave.create", "leave.update", "leave.delete", "leave.approve", 
  "salary_structure.view", "salary_structure.create", "salary_structure.update", "salary_structure.delete",
  "payroll.view", "payroll.create", "payroll.update", "payroll.delete",
  "payslip.view", "payslip.create", "payslip.update", "payslip.delete",
  "profile.view", "profile.update"
];

const employeePermissions = [
  "dashboard.view", 
  "employee.view",
  "attendance.view", "attendance.create",
  "leave.view", "leave.create", "leave.delete", // can request and cancel own leaves
  "salary_structure.view", 
  "payslip.view", 
  "profile.view", "profile.update"
];

const roles = [
  { role_name: "Admin", permissions: adminHrPermissions },
  { role_name: "HR", permissions: adminHrPermissions },
  { role_name: "Employee", permissions: employeePermissions }
];

const seed = async () => {
  try {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const role of roles) {
      const existing = await Role.findOne({ role_name: role.role_name });
      if (existing) {
        existing.permissions = role.permissions;
        await existing.save();
        console.log(`✅ Updated role: "${role.role_name}"`);
        continue;
      }
      await Role.create(role);
      console.log(`✅ Created role: "${role.role_name}"`);
    }

    console.log('🎉 Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding roles:', err);
    process.exit(1);
  }
};

seed();