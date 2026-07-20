import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const payload = { user_id: user._id, role_id: user.role_id };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const expirationTime = () => {
  // returns seconds until expiry
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  // parse, simplified
  return 60 * 60 * 24 * 7; // default 7 days
};