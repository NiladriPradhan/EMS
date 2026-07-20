import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('Admin', 'HR', 'Employee'), DashboardController.index);

export default router;