import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.get('/:id', asyncHandler(getCategoryById));
router.post('/', protect, admin, asyncHandler(createCategory));
router.put('/:id', protect, admin, asyncHandler(updateCategory));
router.delete('/:id', protect, admin, asyncHandler(deleteCategory));

export default router;
