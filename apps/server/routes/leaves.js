import express from 'express';
import LeaveController from '../controllers/LeaveController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.index);
router.get('/pending', authorizeRoles('Admin', 'HR'), LeaveController.pending);
router.get('/employee/:employee_id', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.employeeLeaves);
router.get('/:id', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.show);
router.post('/', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.store);
router.put('/:id', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.update);
router.put('/:id/approve', authorizeRoles('Admin', 'HR'), LeaveController.approve);
router.put('/:id/reject', authorizeRoles('Admin', 'HR'), LeaveController.reject);
router.put('/:id/cancel', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.cancel);
router.put('/:id/reopen', authorizeRoles('Admin', 'HR', 'Employee'), LeaveController.reopen);
router.delete('/:id', authorizeRoles('Admin', 'HR'), LeaveController.destroy);

export default router;