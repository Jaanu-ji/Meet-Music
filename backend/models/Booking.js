import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    artist: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ArtistProfile' },
    service: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    message: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
