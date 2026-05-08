import express from 'express';
import asyncHandler from 'express-async-handler';
import { getBands, getBandById, createBand, joinBand, rateBand } from '../controllers/bandController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(getBands));
router.get('/:id', asyncHandler(getBandById));
router.post('/', protect, asyncHandler(createBand));
router.post('/:id/join', protect, asyncHandler(joinBand));
router.post('/:id/rate', protect, asyncHandler(rateBand));

export default router;
