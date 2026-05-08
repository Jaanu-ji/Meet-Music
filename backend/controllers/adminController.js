import User from '../models/User.js';
import ArtistProfile from '../models/ArtistProfile.js';
import Booking from '../models/Booking.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res) => {
  const userCount = await User.countDocuments();
  const artistCount = await ArtistProfile.countDocuments();
  const bookingCount = await Booking.countDocuments();
  const courseCount = await Course.countDocuments();
  const categoryCount = await Category.countDocuments();

  return successResponse(res, {
    userCount,
    artistCount,
    bookingCount,
    courseCount,
    categoryCount,
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  return successResponse(res, users);
};

export const getAllArtists = async (req, res) => {
  const artists = await ArtistProfile.find().populate('user', 'name email');
  return successResponse(res, artists);
};

export const getRecentBookings = async (req, res) => {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(25)
    .populate('user', 'name email')
    .populate('artist', 'stageName');
  return successResponse(res, bookings);
};
