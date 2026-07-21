import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';

// Import routes (all must use .js extension)
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import departmentRoutes from './routes/departments.js';
import designationRoutes from './routes/designations.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import salaryStructureRoutes from './routes/salary-structures.js';
import salaryRoutes from './routes/salaries.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());


const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:3000", ,
  process.env.CLIENT_URL,  // Production frontend from Render env
];
console.log("CLIENT_URL:", process.env.CLIENT_URL);
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
// app.use((req, res) => {
//   return res.json("EMS server is running")
// })
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary-structures', salaryStructureRoutes);
app.use('/api/salaries', salaryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});