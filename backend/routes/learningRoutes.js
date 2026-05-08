import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  getCourses,
  getCourseById,
  getLessonById,
  enrollCourse,
  getMyEnrollments,
  completeLesson,
  createCourse,
  updateCourse,
  updateLesson,
  deleteCourse,
} from '../controllers/learningController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', asyncHandler(getCourses));
router.get('/enrolled', protect, asyncHandler(getMyEnrollments));
router.get('/lesson/:lessonId', asyncHandler(getLessonById));
router.get('/:id', asyncHandler(getCourseById));
router.post('/', protect, admin, asyncHandler(createCourse));
router.put('/:id', protect, asyncHandler(updateCourse));
router.delete('/:id', protect, admin, asyncHandler(deleteCourse));
router.post('/:id/enroll', protect, asyncHandler(enrollCourse));
router.post('/:courseId/lessons/:lessonId/complete', protect, asyncHandler(completeLesson));
router.put('/:courseId/lessons/:lessonId', protect, asyncHandler(updateLesson));

export default router;
