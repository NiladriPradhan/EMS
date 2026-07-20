import User from '../models/User.js';
import Role from '../models/Role.js';
import Employee from '../models/Employee.js';
import UserToken from '../models/UserToken.js';
import PasswordReset from '../models/PasswordReset.js';
import { sendResponse } from '../helpers/response.js';
import { generateToken, expirationTime } from '../helpers/auth.js';

// Helper to get permissions
const getPermissions = async (roleId) => {
  const role = await Role.findById(roleId);
  return role ? role.permissions : [];
};

const AuthController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, false, 'Email and password are required', null, 400);
    }
    const user = await User.findOne({ email }).populate('role_id');
    if (!user) {
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }
    if (user.status !== 'Active') {
      return sendResponse(res, false, 'Account is inactive', null, 403);
    }
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }

    const token = generateToken(user);
    const expiresAt = new Date(Date.now() + expirationTime() * 1000);

    await UserToken.create({ user_id: user._id, token, expires_at: expiresAt });

    const userObj = user.toObject();
    delete userObj.password;

    const permissions = await getPermissions(user.role_id);
    userObj.permissions = permissions;

    return sendResponse(res, true, 'Login successful', { token, user: userObj });
  },

  me: async (req, res) => {
    const user = await User.findById(req.user.user_id).populate('role_id');
    if (!user) return sendResponse(res, false, 'User not found', null, 404);
    const permissions = await getPermissions(user.role_id);
    const userObj = user.toObject();
    delete userObj.password;
    userObj.permissions = permissions;
    return sendResponse(res, true, 'Profile fetched successfully', userObj);
  },

  logout: async (req, res) => {
    await UserToken.findOneAndUpdate({ token: req.token }, { revoked: true });
    return sendResponse(res, true, 'Logout successful');
  },

  logoutAll: async (req, res) => {
    await UserToken.updateMany({ user_id: req.user.user_id }, { revoked: true });
    return sendResponse(res, true, 'Logged out from all devices');
  },

  changePassword: async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    if (!current_password || !new_password || !confirm_password) {
      return sendResponse(res, false, 'Missing required fields', null, 400);
    }
    if (new_password !== confirm_password) {
      return sendResponse(res, false, 'New password and confirm password do not match', null, 400);
    }
    const user = await User.findById(req.user.user_id);
    if (!user) return sendResponse(res, false, 'User not found', null, 404);
    const isValid = await user.comparePassword(current_password);
    if (!isValid) {
      return sendResponse(res, false, 'Current password is incorrect', null, 401);
    }
    user.password = new_password;
    await user.save();
    await UserToken.updateMany({ user_id: user._id }, { revoked: true });
    return sendResponse(res, true, 'Password changed successfully. Please login again.');
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, false, 'Email is required', null, 400);
    const user = await User.findOne({ email });
    if (!user || user.status !== 'Active') {
      return sendResponse(res, true, 'If the email exists, a password reset link will be sent.');
    }
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    await PasswordReset.create({ user_id: user._id, token, expires_at: expiresAt });
    return sendResponse(res, true, 'Password reset token generated successfully.', { reset_token: token, expires_at: expiresAt });
  },

  resetPassword: async (req, res) => {
    const { token, new_password, confirm_password } = req.body;
    if (!token || !new_password || !confirm_password) {
      return sendResponse(res, false, 'Missing required fields', null, 400);
    }
    if (new_password !== confirm_password) {
      return sendResponse(res, false, 'Passwords do not match', null, 400);
    }
    const reset = await PasswordReset.findOne({ token, used: false, expires_at: { $gt: new Date() } });
    if (!reset) {
      return sendResponse(res, false, 'Invalid or expired reset token', null, 400);
    }
    const user = await User.findById(reset.user_id);
    if (!user) return sendResponse(res, false, 'User not found', null, 404);
    user.password = new_password;
    await user.save();
    reset.used = true;
    await reset.save();
    await UserToken.updateMany({ user_id: user._id }, { revoked: true });
    return sendResponse(res, true, 'Password reset successfully. Please login again.');
  },

  directResetPassword: async (req, res) => {
    const { email, new_password, confirm_password } = req.body;
    if (!email || !new_password || !confirm_password) {
      return sendResponse(res, false, 'Missing required fields', null, 400);
    }
    if (new_password !== confirm_password) {
      return sendResponse(res, false, 'Passwords do not match', null, 400);
    }
    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, false, 'User not found with this email', null, 404);
    if (user.status !== 'Active') return sendResponse(res, false, 'Account is inactive', null, 403);
    user.password = new_password;
    await user.save();
    await UserToken.updateMany({ user_id: user._id }, { revoked: true });
    return sendResponse(res, true, 'Password updated successfully. Please login again.');
  },

  register: async (req, res) => {
    const { username, email, password, first_name, last_name, role_id } = req.body;

    // Validate required fields
    if (!username || !email || !password || !first_name || !last_name) {
      return sendResponse(res, false, 'Missing required fields: username, email, password, first_name, last_name', null, 400);
    }

    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return sendResponse(res, false, 'Email or username already exists', null, 409);
    }

    let roleId = role_id;
    if (!roleId) {
      // Find or create default "Employee" role
      let defaultRole = await Role.findOne({ role_name: 'Employee' });
      if (!defaultRole) {
        defaultRole = await Role.create({ role_name: 'Employee', permissions: [] });
      }
      roleId = defaultRole._id;
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      username,
      email,
      password,
      role_id: roleId,
      status: 'Active'
    });

    // Create associated employee
    const employee = await Employee.create({
      user_id: user._id,
      first_name,
      last_name
    });

    return sendResponse(res, true, 'Registration successful', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        status: user.status
      },
      employee
    }, 201);
  }
};

export default AuthController;