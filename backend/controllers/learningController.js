import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getCourses = async (req, res) => {
  const courses = await Course.find()
    .populate('category', 'name')
    .populate('instructor', 'name email');
  return successResponse(res, courses);
};

export const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('category', 'name')
    .populate('instructor', 'name email');
  if (!course) return errorResponse(res, 'Course not found', 404);
  return successResponse(res, course);
};

const authorizeCourseEdit = (course, user) => {
  if (!course) return false;
  if (course.instructor && course.instructor.toString() === user._id.toString()) {
    return true;
  }
  return user.role === 'admin';
};

export const getLessonById = async (req, res) => {
  const course = await Course.findOne({ 'lessons._id': req.params.lessonId })
    .populate('instructor', 'name');
  if (!course) return errorResponse(res, 'Lesson not found', 404);
  const lesson = course.lessons.id(req.params.lessonId);
  return successResponse(res, {
    lesson,
    course: { _id: course._id, title: course.title, totalLessons: course.lessons.length },
  });
};

export const enrollCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return errorResponse(res, 'Course not found', 404);

  const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
  if (existing) return successResponse(res, existing, 'Already enrolled');

  const enrollment = await Enrollment.create({ user: req.user._id, course: course._id });
  return successResponse(res, enrollment, 'Enrolled successfully', 201);
};

export const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate({
    path: 'course',
    populate: [
      { path: 'category', select: 'name' },
      { path: 'instructor', select: 'name' },
    ],
  });
  return successResponse(res, enrollments);
};

export const completeLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
  if (!enrollment) {
    enrollment = await Enrollment.create({ user: req.user._id, course: courseId, completedLessons: [] });
  }
  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
    await enrollment.save();
  }
  return successResponse(res, enrollment, 'Lesson marked as complete');
};

export const createCourse = async (req, res) => {
  const { title, description, category, thumbnailUrl, lessons } = req.body;
  if (!title) return errorResponse(res, 'Course title is required', 400);
  const course = await Course.create({
    title,
    description,
    category,
    thumbnailUrl: thumbnailUrl || '',
    lessons: lessons || [],
    instructor: req.user._id,
  });
  return successResponse(res, course, 'Course created', 201);
};

export const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return errorResponse(res, 'Course not found', 404);
  if (!authorizeCourseEdit(course, req.user)) {
    return errorResponse(res, 'Not authorized to update this course', 403);
  }
  course.title = req.body.title || course.title;
  course.description = req.body.description || course.description;
  course.category = req.body.category || course.category;
  course.thumbnailUrl = req.body.thumbnailUrl || course.thumbnailUrl;
  course.lessons = req.body.lessons || course.lessons;
  const updated = await course.save();
  return successResponse(res, updated, 'Course updated');
};

export const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return errorResponse(res, 'Course not found', 404);
  if (!authorizeCourseEdit(course, req.user)) {
    return errorResponse(res, 'Not authorized to update this lesson', 403);
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) return errorResponse(res, 'Lesson not found', 404);

  lesson.title = req.body.title || lesson.title;
  lesson.content = req.body.content || lesson.content;
  lesson.videoUrl = req.body.videoUrl || lesson.videoUrl;
  if (typeof req.body.published === 'boolean') {
    lesson.published = req.body.published;
  }

  await course.save();
  return successResponse(res, lesson, 'Lesson updated');
};

export const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return errorResponse(res, 'Course not found', 404);
  await course.deleteOne();
  return successResponse(res, {}, 'Course deleted');
};
