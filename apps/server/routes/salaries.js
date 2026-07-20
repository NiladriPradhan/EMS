import express from 'express';
import SalaryController from '../controllers/SalaryController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/generate', authorizeRoles('Admin', 'HR'), SalaryController.generate);
router.get('/', authorizeRoles('Admin', 'HR'), SalaryController.index);
router.get('/:id', authorizeRoles('Admin', 'HR'), SalaryController.show);
router.patch('/:id/pay', authorizeRoles('Admin', 'HR'), SalaryController.pay);
router.delete('/:id', authorizeRoles('Admin', 'HR'), SalaryController.destroy);
router.get('/payslips', authorizeRoles('Admin', 'HR', 'Employee'), SalaryController.payslipIndex);
router.get('/payslips/:id', authorizeRoles('Admin', 'HR', 'Employee'), SalaryController.payslip);

export default router;