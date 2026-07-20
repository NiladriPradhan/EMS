import express from 'express';
import AttendanceController from '../controllers/AttendanceController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR', 'Employee'), AttendanceController.index);
router.post('/', authorizeRoles('Admin', 'HR', 'Employee'), AttendanceController.store);

export default router;