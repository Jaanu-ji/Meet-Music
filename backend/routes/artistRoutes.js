import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  createOrUpdateArtistProfile,
  getAllArtists,
  getArtistById,
  getCurrentArtistProfile,
  updateAvailability,
  rateArtist,
} from '../controllers/artistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(getAllArtists));
router.get('/me', protect, asyncHandler(getCurrentArtistProfile));
router.get('/:id', asyncHandler(getArtistById));
router.post('/me', protect, asyncHandler(createOrUpdateArtistProfile));
router.put('/me/availability', protect, asyncHandler(updateAvailability));
router.put('/me', protect, asyncHandler(createOrUpdateArtistProfile));
router.post('/:id/rate', protect, asyncHandler(rateArtist));

export default router;
