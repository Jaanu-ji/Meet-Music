import Band from '../models/Band.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { notify } from '../utils/notifyHelper.js';

const genreEmoji = {
  Rock: '🎸', Jazz: '🎷', Classical: '🎻', Blues: '🎵',
  Electronic: '🎧', Pop: '🎤', Metal: '🤘', Folk: '🪕',
  'Hip Hop': '🎤', Other: '🎵',
};

export const getBands = async (req, res) => {
  const bands = await Band.find()
    .populate('creator', 'name')
    .populate('members.user', 'name')
    .sort({ averageRating: -1, createdAt: -1 });
  return successResponse(res, bands);
};

export const getBandById = async (req, res) => {
  const band = await Band.findById(req.params.id)
    .populate('creator', 'name')
    .populate('members.user', 'name');
  if (!band) return errorResponse(res, 'Band not found', 404);
  return successResponse(res, band);
};

export const createBand = async (req, res) => {
  const { name, genre, city, description, lookingFor, bannerImageUrl } = req.body;
  if (!name || !genre || !city) {
    return errorResponse(res, 'name, genre and city are required', 400);
  }
  const band = await Band.create({
    name,
    genre,
    city,
    description: description || '',
    lookingFor: lookingFor || '',
    bannerImageUrl: bannerImageUrl || '',
    emoji: genreEmoji[genre] || '🎵',
    creator: req.user._id,
    members: [{ user: req.user._id, role: 'Creator' }],
  });
  return successResponse(res, band, 'Band created', 201);
};

export const rateBand = async (req, res) => {
  const { value } = req.body;
  if (!value || value < 1 || value > 5) {
    return errorResponse(res, 'Rating must be between 1 and 5', 400);
  }

  const band = await Band.findById(req.params.id);
  if (!band) return errorResponse(res, 'Band not found', 404);

  const existing = band.ratings.find(
    (r) => r.user?.toString() === req.user._id.toString()
  );

  if (existing) {
    existing.value = value;
  } else {
    band.ratings.push({ user: req.user._id, value });
  }

  band.ratingCount = band.ratings.length;
  band.averageRating =
    Math.round(
      (band.ratings.reduce((sum, r) => sum + r.value, 0) / band.ratingCount) * 10
    ) / 10;

  await band.save();
  return successResponse(res, { averageRating: band.averageRating, ratingCount: band.ratingCount }, 'Rated successfully');
};

export const joinBand = async (req, res) => {
  const band = await Band.findById(req.params.id)
    .populate('creator', 'name');
  if (!band) return errorResponse(res, 'Band not found', 404);

  const alreadyMember = band.members.some(
    (m) => m.user?.toString() === req.user._id.toString()
  );
  if (alreadyMember) return errorResponse(res, 'Already a member of this band', 400);

  band.members.push({ user: req.user._id, role: req.body.role || 'Member' });
  await band.save();

  await notify(
    band.creator._id,
    'band',
    'New Band Member',
    `${req.user.name} joined your band "${band.name}"`
  );

  return successResponse(res, band, 'Joined band successfully');
};
