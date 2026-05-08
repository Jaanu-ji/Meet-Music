import express from 'express';
import asyncHandler from 'express-async-handler';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, asyncHandler(getNotifications));
router.put('/read-all', protect, asyncHandler(markAllRead));
router.put('/:id/read', protect, asyncHandler(markRead));

export default router;
