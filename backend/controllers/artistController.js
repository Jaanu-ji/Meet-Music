import ArtistProfile from '../models/ArtistProfile.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { buildArtistFilter } from '../utils/artistFilter.js';

export const createOrUpdateArtistProfile = async (req, res) => {
  if (!req.body.stageName) {
    return errorResponse(res, 'Stage name is required', 400);
  }

  const existing = await ArtistProfile.findOne({ user: req.user._id });
  const normalizedPortfolio = (() => {
    const rawPortfolio = req.body.portfolio;
    const rawPortfolioUrls = req.body.portfolioUrls;

    if (Array.isArray(rawPortfolio) && rawPortfolio.length > 0) {
      return rawPortfolio
        .map((item) => ({
          url: item?.url,
          type: item?.type === 'video' ? 'video' : 'image',
        }))
        .filter((item) => Boolean(item.url));
    }

    if (Array.isArray(rawPortfolioUrls) && rawPortfolioUrls.length > 0) {
      return rawPortfolioUrls
        .filter((url) => typeof url === 'string' && url.trim())
        .map((url) => ({
          url: url.trim(),
          type: url.includes('/video/upload/') || /\.(mp4|mov|webm|mkv)(\?|$)/i.test(url) ? 'video' : 'image',
        }));
    }

    return [];
  })();

  const data = {
    user: req.user._id,
    stageName: req.body.stageName,
    bio: req.body.bio || '',
    genres: req.body.genres || [],
    location: req.body.location || '',
    services: req.body.services || [],
    languages: req.body.languages || [],
    category: req.body.category || null,
    photoUrl: req.body.photoUrl || '',
    portfolio: normalizedPortfolio,
    socialLinks: req.body.socialLinks || {},
    artistType: req.body.artistType || 'music',
    artistCategory: req.body.artistCategory || 'individual',
  };

  if (existing) {
    const updated = await ArtistProfile.findByIdAndUpdate(existing._id, data, { new: true });
    return successResponse(res, updated, 'Artist profile updated');
  }

  const profile = await ArtistProfile.create(data);
  return successResponse(res, profile, 'Artist profile created', 201);
};

export const getAllArtists = async (req, res) => {
  const filter = buildArtistFilter(req.query);
  const artists = await ArtistProfile.find(filter)
    .populate('user', 'name email profileImageUrl')
    .populate('category', 'name')
    .sort({ averageRating: -1, createdAt: -1 });
  return successResponse(res, artists);
};

export const rateArtist = async (req, res) => {
  const { value, review } = req.body;
  if (!value || value < 1 || value > 5) {
    return errorResponse(res, 'Rating must be between 1 and 5', 400);
  }

  const artist = await ArtistProfile.findById(req.params.id);
  if (!artist) return errorResponse(res, 'Artist not found', 404);

  if (artist.user.toString() === req.user._id.toString()) {
    return errorResponse(res, 'You cannot rate your own profile', 400);
  }

  const existing = artist.ratings.find(
    (r) => r.user?.toString() === req.user._id.toString()
  );

  if (existing) {
    existing.value = value;
    existing.review = review || existing.review || '';
    existing.createdAt = new Date();
  } else {
    artist.ratings.push({ user: req.user._id, value, review: review || '', createdAt: new Date() });
  }

  artist.ratingCount = artist.ratings.length;
  artist.averageRating =
    Math.round(
      (artist.ratings.reduce((sum, r) => sum + r.value, 0) / artist.ratingCount) * 10
    ) / 10;

  await artist.save();

  const populated = await ArtistProfile.findById(artist._id).populate('ratings.user', 'name');
  return successResponse(res, {
    averageRating: artist.averageRating,
    ratingCount: artist.ratingCount,
    ratings: populated.ratings,
  }, 'Rated successfully');
};

export const getArtistById = async (req, res) => {
  const artist = await ArtistProfile.findById(req.params.id)
    .populate('user', 'name email profileImageUrl')
    .populate('ratings.user', 'name')
    .populate('category', 'name');
  if (!artist) {
    return errorResponse(res, 'Artist not found', 404);
  }
  return successResponse(res, artist);
};

export const getCurrentArtistProfile = async (req, res) => {
  const profile = await ArtistProfile.findOne({ user: req.user._id }).populate('user', 'name email profileImageUrl').populate('category', 'name');
  if (!profile) {
    return errorResponse(res, 'Artist profile not found', 404);
  }
  return successResponse(res, profile);
};

export const updateAvailability = async (req, res) => {
  const { availability } = req.body;
  if (!['available', 'busy'].includes(availability)) {
    return errorResponse(res, 'Invalid availability value', 400);
  }
  const profile = await ArtistProfile.findOneAndUpdate(
    { user: req.user._id },
    { availability },
    { new: true }
  );
  if (!profile) {
    return errorResponse(res, 'Artist profile not found', 404);
  }
  return successResponse(res, profile, 'Availability updated');
};
