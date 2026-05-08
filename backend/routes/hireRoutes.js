import express from 'express';
import asyncHandler from 'express-async-handler';
import { searchArtists, bookArtist } from '../controllers/hireController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', asyncHandler(searchArtists));
router.post('/book', protect, asyncHandler(bookArtist));

export default router;
