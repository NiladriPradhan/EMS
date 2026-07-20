import express from 'express';
import DesignationController from '../controllers/DesignationController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('Admin', 'HR', 'Employee'), DesignationController.index);
router.get('/:id', authorizeRoles('Admin', 'HR', 'Employee'), DesignationController.show);
router.post('/', authorizeRoles('Admin', 'HR'), DesignationController.store);
router.put('/:id', authorizeRoles('Admin', 'HR'), DesignationController.update);
router.delete('/:id', authorizeRoles('Admin', 'HR'), DesignationController.destroy);

export default router;