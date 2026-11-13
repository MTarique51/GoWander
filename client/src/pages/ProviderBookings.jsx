import { useEffect, useState } from 'react';
import api from '../lib/api';
export default function ProviderBookings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  async function load() {
    const { data } = await api.get('/bookings/provider');
    setItems(data.bookings);
  }
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function update(id, status) {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update booking.');
    }
  }
  return (
    <div className="container-app py-12">
      <p className="eyebrow">Host workspace</p>
      <h1 className="mt-2 text-4xl font-extrabold">Received bookings</h1>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <div className="mt-8 space-y-3">
        {items.map((b) => (
          <div key={b._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <b>{b.listing?.title}</b>
              <p className="mt-1 text-sm text-slate-500">
                {b.traveler?.name} · {b.guests} guests ·{' '}
                {new Date(b.bookingDate).toLocaleDateString()} · ₹{b.totalPrice}
              </p>
              <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">
                {b.status}
              </span>
            </div>
            <div className="flex gap-2">
              {b.status === 'pending' && (
                <>
                  <button className="btn-primary" onClick={() => update(b._id, 'confirmed')}>
                    Confirm
                  </button>
                  <button className="btn-secondary" onClick={() => update(b._id, 'rejected')}>
                    Reject
                  </button>
                </>
              )}
              {b.status === 'confirmed' && (
                <button className="btn-primary" onClick={() => update(b._id, 'completed')}>
                  Mark completed
                </button>
              )}
            </div>
          </div>
        ))}
        {!items.length && (
          <div className="card p-10 text-center text-slate-500">No bookings received yet.</div>
        )}
      </div>
    </div>
  );
}
