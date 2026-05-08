import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: '' },
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const bandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genre: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, default: '' },
    lookingFor: { type: String, default: '' },
    bannerImageUrl: { type: String, default: '' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    emoji: { type: String, default: '🎵' },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Band = mongoose.model('Band', bandSchema);
export default Band;
