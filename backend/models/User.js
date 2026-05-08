import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
    isArtist: { type: Boolean, default: false },
    profileImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
