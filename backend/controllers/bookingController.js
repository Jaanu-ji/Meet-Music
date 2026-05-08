import Booking from '../models/Booking.js';
import ArtistProfile from '../models/ArtistProfile.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { notify } from '../utils/notifyHelper.js';

export const createBooking = async (req, res) => {
  const { artistId, service, scheduledDate, message, amount } = req.body;
  if (!artistId || !service || !scheduledDate) {
    return errorResponse(res, 'artistId, service and scheduledDate are required', 400);
  }

  const artist = await ArtistProfile.findById(artistId);
  if (!artist) return errorResponse(res, 'Artist not found', 404);

  const booking = await Booking.create({
    user: req.user._id,
    artist: artist._id,
    service,
    scheduledDate,
    message: message || '',
    amount: amount || artist.rate || 0,
  });

  await notify(
    artist.user,
    'booking',
    'New Booking Request',
    `${req.user.name} wants to book you for "${service}"`
  );

  return successResponse(res, booking, 'Booking created', 201);
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('artist', 'stageName location rate')
    .populate('user', 'name email');
  return successResponse(res, bookings);
};

export const getArtistBookings = async (req, res) => {
  const profile = await ArtistProfile.findOne({ user: req.user._id });
  if (!profile) return errorResponse(res, 'Artist profile not found', 404);
  const bookings = await Booking.find({ artist: profile._id })
    .populate('user', 'name email')
    .populate('artist', 'stageName');
  return successResponse(res, bookings);
};

export const updateBookingStatus = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return errorResponse(res, 'Booking not found', 404);

  const artistProfile = await ArtistProfile.findOne({ user: req.user._id });
  const isArtistOwner = artistProfile && artistProfile._id.toString() === booking.artist.toString();

  if (req.user.role !== 'admin' && !isArtistOwner) {
    return errorResponse(res, 'Not authorized to update this booking', 403);
  }

  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return errorResponse(res, 'Invalid status value', 400);
  }

  booking.status = status;
  const updated = await booking.save();

  await notify(
    booking.user,
    'booking',
    `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    `Your booking for "${booking.service}" has been ${status}`
  );

  return successResponse(res, updated, 'Booking status updated');
};

export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('artist', 'stageName');
  return successResponse(res, bookings);
};
