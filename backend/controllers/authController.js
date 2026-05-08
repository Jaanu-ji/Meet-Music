import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Name, email and password are required', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role === 'artist' ? 'artist' : 'user',
    isArtist: role === 'artist',
  });

  return successResponse(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  }, 'Registration successful', 201);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  return successResponse(res, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  }, 'Login successful');
};

export const getProfile = async (req, res) => {
  return successResponse(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isArtist: req.user.isArtist,
    profileImageUrl: req.user.profileImageUrl,
  });
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return errorResponse(res, 'User not found', 404);
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      return errorResponse(res, 'Email already in use', 400);
    }
    user.email = req.body.email;
  }

  user.name = req.body.name || user.name;
  if (req.body.profileImageUrl) {
    user.profileImageUrl = req.body.profileImageUrl;
  }
  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await user.save();

  return successResponse(res, {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    isArtist: updatedUser.isArtist,
    profileImageUrl: updatedUser.profileImageUrl,
  }, 'Profile updated');
};
