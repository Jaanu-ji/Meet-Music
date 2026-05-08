import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const artistProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
    stageName: { type: String, required: true },
    bio: { type: String, default: '' },
    genres: [{ type: String }],
    location: { type: String, default: '' },
    services: [{ type: String }],
    rate: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    languages: [{ type: String }],
    photoUrl: { type: String, default: '' },
    portfolio: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
      },
    ],
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    availability: { type: String, enum: ['available', 'busy'], default: 'available' },
    artistType: { type: String, enum: ['music', 'dance'], default: 'music' },
    artistCategory: { type: String, enum: ['individual', 'band'], default: 'individual' },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ArtistProfile = mongoose.model('ArtistProfile', artistProfileSchema);
export default ArtistProfile;
