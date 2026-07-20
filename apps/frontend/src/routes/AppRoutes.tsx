import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import AppLoader from "../components/AppLoader";

// Auth Pages – lazy load them too (optional but recommended)
const Login = lazy(() => import("../pages/auth/Login"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Unauthorized = lazy(() => import("../pages/auth/Unauthorized"));

// Protected Pages
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Employees = lazy(() => import("../pages/employees/Employees"));
const Departments = lazy(() => import("../pages/departments/Departments"));
const Designations = lazy(() => import("../pages/designations/Designations"));
const Attendance = lazy(() => import("../pages/attendance/Attendance"));
const Leaves = lazy(() => import("../pages/leaves/Leaves"));
const SalaryStructure = lazy(() => import("../pages/salary/SalaryStructure"));
const Payroll = lazy(() => import("../pages/payroll/Payroll"));
const Payslips = lazy(() => import("../pages/payslips/Payslips"));
const Profile = lazy(() => import("../pages/profile/Profile"));

// Layout is a component that contains Navbar + Sidebar – can stay as direct import (small)
import Layout from "../components/Layout/Layout";

const IndexRedirect = () => {
  const { hasPermission } = usePermissions();
  if (hasPermission("dashboard.view"))
    return <Navigate to="/dashboard" replace />;
  if (hasPermission("profile.view")) return <Navigate to="/profile" replace />;
  return <Navigate to="/unauthorized" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return <AppLoader />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<IndexRedirect />} />

          <Route
            path="dashboard"
            element={
              <PrivateRoute permission="dashboard.view">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="employees"
            element={
              <PrivateRoute permission="employee.view">
                <Employees />
              </PrivateRoute>
            }
          />
          <Route
            path="departments"
            element={
              <PrivateRoute permission="department.view">
                <Departments />
              </PrivateRoute>
            }
          />
          <Route
            path="designations"
            element={
              <PrivateRoute permission="designation.view">
                <Designations />
              </PrivateRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <PrivateRoute permission="attendance.view">
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="leaves"
            element={
              <PrivateRoute permission="leave.view">
                <Leaves />
              </PrivateRoute>
            }
          />
          <Route
            path="salary-structure"
            element={
              <PrivateRoute permission="salary_structure.view">
                <SalaryStructure />
              </PrivateRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <PrivateRoute permission="payroll.view">
                <Payroll />
              </PrivateRoute>
            }
          />
          <Route
            path="payslips"
            element={
              <PrivateRoute permission="payslip.view">
                <Payslips />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute permission="profile.view">
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={
            isAuthenticated ? <IndexRedirect /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
