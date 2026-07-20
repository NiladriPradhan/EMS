import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authMiddleware, authorizeRoles('Admin', 'HR', 'Employee'), AuthController.me);
router.post('/logout', authMiddleware, authorizeRoles('Admin', 'HR', 'Employee'), AuthController.logout);
router.post('/logout-all', authMiddleware, authorizeRoles('Admin', 'HR', 'Employee'), AuthController.logoutAll);
router.post('/change-password', authMiddleware, authorizeRoles('Admin', 'HR', 'Employee'), AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/direct-reset-password', authMiddleware, authorizeRoles('Admin'), AuthController.directResetPassword);

export default router;