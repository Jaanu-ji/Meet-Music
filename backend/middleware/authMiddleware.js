import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'Not authorized, user not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Not authorized, token invalid', 401);
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};
