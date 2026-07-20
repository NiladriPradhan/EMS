import express from 'express';
import SalaryStructureController from '../controllers/SalaryStructureController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR'), SalaryStructureController.index);
router.get('/:id', authorizeRoles('Admin', 'HR', 'Employee'), SalaryStructureController.show);
router.post('/', authorizeRoles('Admin', 'HR'), SalaryStructureController.store);
router.put('/:id', authorizeRoles('Admin', 'HR'), SalaryStructureController.update);
router.delete('/:id', authorizeRoles('Admin', 'HR'), SalaryStructureController.destroy);

export default router;