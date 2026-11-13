import { useEffect, useState } from 'react';
import api from '../lib/api';
export default function Notifications() {
  const [items, setItems] = useState([]);
  async function load() {
    const { data } = await api.get('/notifications');
    setItems(data.notifications);
  }
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function read(id) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }
  return (
    <div className="container-app max-w-3xl py-12">
      <p className="eyebrow">Updates</p>
      <h1 className="mt-2 text-4xl font-extrabold">Notifications</h1>
      <div className="mt-8 space-y-3">
        {items.map((n) => (
          <button
            key={n._id}
            onClick={() => read(n._id)}
            className={`card block w-full p-5 text-left ${n.readAt ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between gap-3">
              <b>{n.title}</b>
              {!n.readAt && <span className="h-2 w-2 rounded-full bg-brand-500" />}
            </div>
            <p className="mt-2 text-sm text-slate-600">{n.message}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
          </button>
        ))}
        {!items.length && (
          <div className="card p-10 text-center text-slate-500">No notifications yet.</div>
        )}
      </div>
    </div>
  );
}
