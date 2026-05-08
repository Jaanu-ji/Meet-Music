import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import { imageUpload, videoUpload } from '../middleware/uploadMiddleware.js';
import { uploadImage, uploadVideo } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/image', protect, imageUpload.single('file'), asyncHandler(uploadImage));
router.post('/video', protect, videoUpload.single('file'), asyncHandler(uploadVideo));

export default router;
