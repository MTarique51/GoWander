import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [reviewed, setReviewed] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  async function load() {
    const { data } = await api.get('/bookings/my');
    setBookings(data.bookings);
    setReviewed(data.reviewedBookingIds);
  }
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        bookingId: reviewing,
        rating: Number(form.rating),
        comment: form.comment,
      });
      setMessage('Review submitted. Thank you!');
      setReviewing(null);
      setForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review.');
    }
  }
  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled by traveler' });
      load();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Unable to cancel.');
    }
  }
  return (
    <div className="container-app py-12">
      <p className="eyebrow">Your travel plans</p>
      <h1 className="mt-2 text-4xl font-extrabold">My bookings</h1>
      {message && (
        <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">{message}</p>
      )}
      <div className="mt-8 space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="card grid gap-5 p-5 sm:grid-cols-[150px_1fr_auto]">
            <img
              className="h-32 w-full rounded-xl object-cover sm:w-36"
              src={b.listing?.images?.[0]}
              alt={b.listing?.title}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {new Date(b.bookingDate).toLocaleDateString()}
              </p>
              <h2 className="mt-1 text-lg font-extrabold">{b.listing?.title || 'Experience'}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {b.guests} guests · ₹{b.totalPrice.toLocaleString('en-IN')} · Host:{' '}
                {b.provider?.name}
              </p>
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                {b.status}
              </span>
            </div>
            <div className="flex flex-wrap items-start gap-2 sm:flex-col">
              <Link to={'/listings/' + b.listing._id} className="btn-primary">
                View
              </Link>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn-secondary" onClick={() => cancel(b._id)}>
                  Cancel
                </button>
              )}
              {b.status === 'completed' && !reviewed.includes(b._id) && (
                <button className="btn-primary" onClick={() => setReviewing(b._id)}>
                  Write review
                </button>
              )}
            </div>
            {reviewing === b._id && (
              <form
                onSubmit={submitReview}
                className="col-span-full grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[150px_1fr_auto]"
              >
                <select
                  className="field"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  placeholder="Share your experience…"
                  required
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
                <button className="btn-primary">Submit</button>
              </form>
            )}
          </div>
        ))}
        {!bookings.length && (
          <div className="card p-12 text-center text-slate-500">
            You haven't booked an experience yet.{' '}
            <Link className="font-bold text-brand-700" to="/">
              Explore experiences
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
