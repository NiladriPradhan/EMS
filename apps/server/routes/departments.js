import express from 'express';
import DepartmentController from '../controllers/DepartmentController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR', 'Employee'), DepartmentController.index);
router.get('/:id', authorizeRoles('Admin', 'HR', 'Employee'), DepartmentController.show);
router.post('/', authorizeRoles('Admin', 'HR'), DepartmentController.store);
router.put('/:id', authorizeRoles('Admin', 'HR'), DepartmentController.update);
router.delete('/:id', authorizeRoles('Admin', 'HR'), DepartmentController.destroy);

export default router;