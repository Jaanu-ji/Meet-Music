import express from 'express';
import asyncHandler from 'express-async-handler';
import { getDashboardStats, getAllUsers, getAllArtists, getRecentBookings } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);
router.get('/dashboard', asyncHandler(getDashboardStats));
router.get('/users', asyncHandler(getAllUsers));
router.get('/artists', asyncHandler(getAllArtists));
router.get('/bookings', asyncHandler(getRecentBookings));

export default router;
