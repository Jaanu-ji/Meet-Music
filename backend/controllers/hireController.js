import ArtistProfile from '../models/ArtistProfile.js';
import Booking from '../models/Booking.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { buildArtistFilter } from '../utils/artistFilter.js';
import { notify } from '../utils/notifyHelper.js';

export const searchArtists = async (req, res) => {
  const filter = buildArtistFilter(req.query);
  const artists = await ArtistProfile.find(filter)
    .populate('user', 'name email')
    .populate('category', 'name');
  return successResponse(res, artists);
};

export const bookArtist = async (req, res) => {
  const { artistId, service, scheduledDate, message, amount } = req.body;
  if (!artistId || !service || !scheduledDate) {
    return errorResponse(res, 'artistId, service and scheduledDate are required', 400);
  }

  const artist = await ArtistProfile.findById(artistId);
  if (!artist) return errorResponse(res, 'Artist profile not found', 404);

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

  return successResponse(res, booking, 'Artist booking request created', 201);
};
