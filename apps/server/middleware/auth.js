import { verifyToken } from '../helpers/auth.js';
import { sendResponse } from '../helpers/response.js';
import Role from '../models/Role.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, false, 'Unauthorized', null, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user payload
    req.token = token;
    next();
  } catch (err) {
    return sendResponse(res, false, 'Invalid or expired token', null, 401);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role_id) {
        return sendResponse(res, false, 'Forbidden: No role assigned', null, 403);
      }
      const role = await Role.findById(req.user.role_id);
      if (!role) {
        return sendResponse(res, false, 'Forbidden: Role not found', null, 403);
      }
      if (!allowedRoles.includes(role.role_name)) {
        return sendResponse(res, false, `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}`, null, 403);
      }
      req.userRole = role; 
      next();
    } catch (err) {
      return sendResponse(res, false, 'Error checking role', null, 500);
    }
  };
};