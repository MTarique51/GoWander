import Favorite from '../models/Favorite.js';

export async function getFavorites(req, res) {
  const items = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'listing',
      match: { status: 'published' },
      populate: { path: 'provider', select: 'name' },
    })
    .sort({ createdAt: -1 });
  res.json({ items: items.filter((item) => item.listing) });
}

export async function addFavorite(req, res) {
  await Favorite.findOneAndUpdate(
    { user: req.user._id, listing: req.params.listingId },
    { user: req.user._id, listing: req.params.listingId },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ message: 'Added to favorites.' });
}

export async function removeFavorite(req, res) {
  await Favorite.deleteOne({ user: req.user._id, listing: req.params.listingId });
  res.json({ message: 'Removed from favorites.' });
}
