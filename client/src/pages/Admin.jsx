import { useEffect, useState } from 'react';
import { Users, Compass, CalendarCheck, IndianRupee, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../lib/api';
import StatCard from '../components/StatCard';

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [applications, setApplications] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('applications');
  const [error, setError] = useState('');
  async function load() {
    const [o, a, l] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/providers/applications'),
      api.get('/admin/listings'),
    ]);
    setOverview(o.data);
    setApplications(a.data.applications);
    setListings(l.data.listings);
  }
  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Could not load admin data.'));
  }, []);
  async function review(id, status) {
    try {
      await api.patch(`/providers/applications/${id}`, { status });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed.');
    }
  }
  async function moderate(id, status) {
    try {
      await api.patch(`/admin/listings/${id}`, { status });
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed.');
    }
  }
  const stats = overview?.stats;
  return (
    <div className="container-app py-12">
      <p className="eyebrow">Platform control center</p>
      <h1 className="mt-2 text-4xl font-extrabold">Admin dashboard</h1>
      <p className="mt-2 text-slate-500">
        Monitor marketplace activity and manage quality across GoWander.
      </p>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={stats.users} icon={Users} />
          <StatCard label="Approved providers" value={stats.providers} icon={ShieldCheck} />
          <StatCard label="Listings" value={stats.listings} icon={Compass} />
          <StatCard label="Bookings" value={stats.bookings} icon={CalendarCheck} />
          <StatCard
            label="Gross booking value"
            value={`₹${stats.grossBookingValue.toLocaleString('en-IN')}`}
            icon={IndianRupee}
          />
        </div>
      )}
      {overview && (
        <div className="card mt-6 p-6">
          <h2 className="text-lg font-extrabold">Booking activity</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f9f83" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-2">
        {[
          ['applications', 'Provider applications'],
          ['listings', 'Listing moderation'],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600'}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === 'applications' ? (
        <div className="mt-4 space-y-3">
          {applications.map((a) => (
            <div key={a._id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">{a.status}</p>
                <h3 className="mt-1 font-extrabold">{a.businessName}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {a.user?.name} · {a.user?.email} · {a.experienceYears} years experience
                </p>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">{a.description}</p>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => review(a._id, 'approved')}>
                    Approve
                  </button>
                  <button className="btn-secondary" onClick={() => review(a._id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {listings.map((x) => (
            <div key={x._id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <b>{x.title}</b>
                <p className="mt-1 text-xs text-slate-500">
                  {x.provider?.name} · {x.location.city} · {x.status}
                </p>
              </div>
              <div className="flex gap-2">
                {x.status !== 'published' && (
                  <button className="btn-primary" onClick={() => moderate(x._id, 'published')}>
                    Publish
                  </button>
                )}
                {x.status === 'published' && (
                  <button className="btn-secondary" onClick={() => moderate(x._id, 'paused')}>
                    Pause
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
