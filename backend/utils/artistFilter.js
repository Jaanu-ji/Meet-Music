export const buildArtistFilter = ({ genre, category, location, search, artistType, artistCategory }) => {
  const filter = {};
  if (genre) filter.genres = genre;
  if (category) filter.category = category;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (search) filter.stageName = { $regex: search, $options: 'i' };
  if (artistType) filter.artistType = artistType;
  if (artistCategory) filter.artistCategory = artistCategory;
  return filter;
};
