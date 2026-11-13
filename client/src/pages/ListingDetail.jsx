import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Users, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api
      .get(`/listings/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setMessage('Experience not found.'));
  }, [id]);
  async function book() {
    if (!user) return navigate('/login');
    setBusy(true);
    setMessage('');
    try {
      await api.post('/bookings', { listingId: id, bookingDate: date, guests });
      setMessage('Booking request submitted! You can track it in My bookings.');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Could not create booking.');
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <div className="container-app py-20 text-slate-500">{message || 'Loading experience…'}</div>
    );
  const { listing, reviews } = data;
  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <p className="eyebrow capitalize">{listing.category} experience</p>
        <h1 className="mt-2 text-4xl font-extrabold">{listing.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={15} />
            {listing.location.city}, {listing.location.country}
          </span>
          <span className="flex items-center gap-1">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {listing.averageRating.toFixed(1)} · {listing.reviewCount} reviews
          </span>
          <span className="flex items-center gap-1">
            <Clock size={15} />
            {listing.durationHours} hours
          </span>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_.8fr]">
        <div>
          <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-3xl">
            {(listing.images?.length
              ? listing.images
              : ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200']
            )
              .slice(0, 4)
              .map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={`${listing.title} ${i + 1}`}
                  className={`h-64 w-full object-cover ${i === 0 ? 'col-span-2 h-96' : ''}`}
                />
              ))}
          </div>
          <div className="mt-9">
            <h2 className="text-2xl font-extrabold">About this experience</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
              {listing.description}
            </p>
          </div>
          <div className="mt-8 grid gap-7 sm:grid-cols-2">
            <div>
              <h3 className="font-extrabold">What's included</h3>
              {listing.included?.map((x) => (
                <p key={x} className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-brand-600" />
                  {x}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-extrabold">Highlights</h3>
              {listing.highlights?.map((x) => (
                <p key={x} className="mt-3 text-sm text-slate-600">
                  ✦ {x}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold">Traveler reviews</h2>
            {reviews.length ? (
              reviews.map((r) => (
                <div key={r._id} className="mt-5 border-b border-slate-100 pb-5">
                  <div className="flex justify-between">
                    <b>{r.traveler?.name}</b>
                    <span className="text-amber-500">★ {r.rating}/5</span>
                  </div>
                  {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                  <p className="mt-1 text-sm leading-6 text-slate-600">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No reviews yet. Be the first after your experience.
              </p>
            )}
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-soft lg:sticky lg:top-28">
          <p className="text-sm text-slate-500">From</p>
          <p className="mt-1 text-3xl font-extrabold">
            ₹{listing.price.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-normal text-slate-500">/ person</span>
          </p>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              Choose date
              <input
                type="date"
                className="field mt-2"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Guests
              <select
                className="field mt-2"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Total</span>
            <b className="text-xl">₹{(listing.price * guests).toLocaleString('en-IN')}</b>
          </div>
          <button disabled={!date || busy} onClick={book} className="btn-primary mt-5 w-full">
            {busy ? 'Submitting…' : 'Request to book'}
          </button>
          {message && (
            <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">{message}</p>
          )}
          <p className="mt-4 text-center text-xs text-slate-400">
            No online payment is collected in this demo.
          </p>
        </aside>
      </div>
    </div>
  );
}
