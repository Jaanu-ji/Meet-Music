import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  createBooking,
  getMyBookings,
  getArtistBookings,
  updateBookingStatus,
  getAllBookings,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, asyncHandler(createBooking));
router.get('/me', protect, asyncHandler(getMyBookings));
router.get('/artist', protect, asyncHandler(getArtistBookings));
router.put('/:id/status', protect, asyncHandler(updateBookingStatus));
router.get('/', protect, admin, asyncHandler(getAllBookings));

export default router;
