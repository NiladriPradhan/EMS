# Employee Management System

A robust **HRM (Human Resource Management) API** built with **Node.js**, **Express**, and **MongoDB** (Mongoose). It provides a full suite of features for managing employees, departments, designations, attendance, leaves, salary structures, and payroll – with **role‑based access control** (RBAC) secured by JWT authentication.

---

## ✨ Features

- **Authentication & Authorization** – JWT‑based login/logout (single & all devices), password reset (via email token), and direct reset by admin.
- **Employee Management** – Full CRUD operations for employees, linked to user accounts.
- **Department & Designation Management** – Organise employees hierarchically.
- **Attendance Tracking** – Record daily attendance (Present / Absent / Late) and view all records.
- **Leave Management** – Employees can request, cancel, and re‑request leaves; managers can approve or reject with proper permissions.
- **Salary Structure** – Define salary components (basic, HRA, allowances, deductions) per employee.
- **Payroll Generation** – Generate monthly salary records, mark as paid, and generate payslips.
- **Dashboard** – Aggregate statistics: employee counts, attendance summary, leave statuses.
- **Role‑Based Access Control** – Flexible permissions (`leave.approve`, `payroll.view`) to control access.
- **Security** – Password hashing (bcrypt), JWT with expiration, helmet, CORS.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcrypt
- **Environment Variables:** dotenv
- **Other middleware:** helmet, cors

---

## 📦 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

---

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/employee-management.git
cd employee-management
```
