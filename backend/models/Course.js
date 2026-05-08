import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    thumbnailUrl: { type: String, default: '' },
    lessons: [lessonSchema],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
