import express from 'express';
import EmployeeController from '../controllers/EmployeeController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR', 'Employee'), EmployeeController.index);
router.post('/', authorizeRoles('Admin', 'HR'), EmployeeController.store);
router.get('/:id', authorizeRoles('Admin', 'HR', 'Employee'), EmployeeController.show);
router.put('/:id', authorizeRoles('Admin', 'HR'), EmployeeController.update);
router.delete('/:id', authorizeRoles('Admin', 'HR'), EmployeeController.destroy);

export default router;