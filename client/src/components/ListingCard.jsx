import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useState } from 'react';

export default function ListingCard({ listing, favoriteIds = [], onFavorite }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const favorite = favoriteIds.includes(listing._id);
  async function toggleFavorite() {
    if (!user) return;
    setBusy(true);
    try {
      if (favorite) await api.delete(`/favorites/${listing._id}`);
      else await api.post(`/favorites/${listing._id}`);
      onFavorite?.(listing._id, !favorite);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Link to={`/listings/${listing._id}`}>
      <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={
              listing.images?.[0] ||
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000'
            }
            alt={listing.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold capitalize text-slate-700">
            {listing.category}
          </span>
          {user?.role === 'traveler' && (
            <button
              disabled={busy}
              onClick={toggleFavorite}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-600 hover:text-rose-500"
              aria-label="Toggle favorite"
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {listing.location?.city}, {listing.location?.country}
            </span>
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {Number(listing.averageRating || 0).toFixed(1)} ({listing.reviewCount || 0})
            </span>
          </div>
          <Link
            to={`/listings/${listing._id}`}
            className="line-clamp-2 min-h-14 text-lg font-bold text-slate-900 hover:text-brand-700"
          >
            {listing.title}
          </Link>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <Clock size={13} />
            {listing.durationHours} hours · Hosted by {listing.provider?.name || 'local expert'}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              From{' '}
              <b className="text-xl text-slate-900">₹{listing.price.toLocaleString('en-IN')}</b>
              <span className="text-xs"> / person</span>
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
