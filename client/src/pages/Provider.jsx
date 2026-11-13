import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays, ListChecks } from 'lucide-react';
import api from '../lib/api';
import StatCard from '../components/StatCard';

export default function Provider() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api
      .get('/listings/mine')
      .then(({ data }) => setItems(data.items))
      .catch(() => {});
  }, []);
  const live = items.filter((x) => x.status === 'published').length;
  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Host workspace</p>
          <h1 className="mt-2 text-4xl font-extrabold">Provider dashboard</h1>
          <p className="mt-2 text-slate-500">
            Manage packages independently. Each package can have its own meeting point, including a
            different city.
          </p>
        </div>
        <Link to="/provider/new" className="btn-primary">
          <Plus size={17} /> Create package
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total listings" value={items.length} icon={ListChecks} />
        <StatCard label="Published listings" value={live} icon={CalendarDays} />
        <StatCard label="Draft / paused" value={items.length - live} />
      </div>
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Your packages</h2>
        <Link to="/provider/bookings" className="text-sm font-bold text-brand-700">
          View bookings →
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((x) => (
          <div key={x._id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <img src={x.images?.[0]} className="h-16 w-20 rounded-xl object-cover" alt="" />
              <div>
                <b>{x.title}</b>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {x.location.city} · {x.status} · ₹{x.price}
                </p>
              </div>
            </div>
            <Link to={`/provider/edit/${x._id}`} className="btn-secondary">
              Edit listing
            </Link>
          </div>
        ))}
        {!items.length && (
          <div className="card p-10 text-center text-slate-500">
            Create your first package to start hosting.
          </div>
        )}
      </div>
    </div>
  );
}
