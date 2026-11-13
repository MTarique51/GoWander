import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Crosshair } from 'lucide-react';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';

const defaultPoint = { lat: 32.2451, lng: 77.1802 };
const blank = {
  title: '',
  shortDescription: '',
  description: '',
  category: 'adventure',
  city: '',
  state: '',
  address: '',
  lat: defaultPoint.lat,
  lng: defaultPoint.lng,
  price: 1000,
  durationHours: 2,
  maxGuests: 8,
  image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
  included: 'Local expert host,Small group experience',
  highlights: 'Local insights,Photo stops',
};
const pin = L.divIcon({
  className: '',
  html: '<div style="background:#047857;color:#fff;border:3px solid #fff;border-radius:50% 50% 50% 0;width:24px;height:24px;transform:rotate(-45deg);box-shadow:0 2px 8px #0005"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function PickerCenter({ point }) {
  const map = useMap();
  useEffect(() => {
    map.setView([point.lat, point.lng], 12);
  }, [point.lat, point.lng, map]);
  return null;
}

function LocationPicker({ point, onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return (
    <Marker
      position={[point.lat, point.lng]}
      icon={pin}
      draggable
      eventHandlers={{
        dragend(e) {
          const p = e.target.getLatLng();
          onChange({ lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) });
        },
      }}
    />
  );
}

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        const x = data.listing;
        const coords = x.location?.geo?.coordinates || [defaultPoint.lng, defaultPoint.lat];
        setForm({
          ...blank,
          ...x,
          city: x.location?.city || '',
          state: x.location?.state || '',
          address: x.location?.address || '',
          lng: coords[0],
          lat: coords[1],
          image: x.images?.[0] || '',
          included: x.included?.join(',') || '',
          highlights: x.highlights?.join(',') || '',
        });
      })
      .catch(() => setError('Could not load this package.'));
  }, [id]);

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      durationHours: Number(form.durationHours),
      maxGuests: Number(form.maxGuests),
      images: form.image ? [form.image] : [],
      included: form.included
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      highlights: form.highlights
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      status: 'published',
      location: {
        city: form.city.trim(),
        state: form.state.trim(),
        country: 'India',
        address: form.address.trim(),
        geo: { type: 'Point', coordinates: [Number(form.lng), Number(form.lat)] },
      },
    };
    try {
      if (id) await api.patch(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/provider');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save package. Check all required fields.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-app max-w-5xl py-10">
      <p className="eyebrow">Provider workspace</p>
      <h1 className="mt-2 text-3xl font-extrabold">
        {id ? 'Edit package' : 'Create a travel package'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Every package has its own service details, price and map location. One provider can publish
        packages in different cities.
      </p>
      <form onSubmit={submit} className="card mt-7 grid gap-5 p-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Package title
          <input
            required
            maxLength={120}
            className="field mt-2"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Category
          <select
            className="field mt-2"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {[
              'adventure',
              'culture',
              'food',
              'nature',
              'wellness',
              'sightseeing',
              'workshop',
              'other',
            ].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Short summary
          <input
            className="field mt-2"
            maxLength={220}
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Full description
          <textarea
            required
            rows="4"
            className="field mt-2"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          City / town
          <input
            required
            className="field mt-2"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="e.g. Manali"
          />
        </label>
        <label className="text-sm font-semibold">
          State
          <input
            className="field mt-2"
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            placeholder="e.g. Himachal Pradesh"
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Meeting point / address
          <input
            className="field mt-2"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Landmark or meeting point"
          />
        </label>
        <div className="sm:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-extrabold">Select package location</h2>
              <p className="text-xs text-slate-500">
                Click the map or drag the marker to the exact meeting point.
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              <MapPin size={13} className="mr-1 inline" /> {Number(form.lat).toFixed(5)},{' '}
              {Number(form.lng).toFixed(5)}
            </span>
          </div>
          <MapContainer
            center={[Number(form.lat), Number(form.lng)]}
            zoom={12}
            scrollWheelZoom
            className="h-[360px] w-full rounded-xl border border-slate-200"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <PickerCenter point={{ lat: Number(form.lat), lng: Number(form.lng) }} />
            <LocationPicker
              point={{ lat: Number(form.lat), lng: Number(form.lng) }}
              onChange={(p) => setForm((old) => ({ ...old, ...p }))}
            />
          </MapContainer>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">
              Latitude
              <input
                required
                type="number"
                step="any"
                min="-90"
                max="90"
                className="field mt-1"
                value={form.lat}
                onChange={(e) => set('lat', e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Longitude
              <input
                required
                type="number"
                step="any"
                min="-180"
                max="180"
                className="field mt-1"
                value={form.lng}
                onChange={(e) => set('lng', e.target.value)}
              />
            </label>
          </div>
        </div>
        <label className="text-sm font-semibold">
          Price per guest (₹)
          <input
            required
            min="0"
            type="number"
            className="field mt-2"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Duration (hours)
          <input
            min="0.5"
            step="0.5"
            type="number"
            className="field mt-2"
            value={form.durationHours}
            onChange={(e) => set('durationHours', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Maximum guests
          <input
            min="1"
            type="number"
            className="field mt-2"
            value={form.maxGuests}
            onChange={(e) => set('maxGuests', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Cover image URL
          <input
            className="field mt-2"
            value={form.image}
            onChange={(e) => set('image', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          What's included (comma separated)
          <input
            className="field mt-2"
            value={form.included}
            onChange={(e) => set('included', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Highlights (comma separated)
          <input
            className="field mt-2"
            value={form.highlights}
            onChange={(e) => set('highlights', e.target.value)}
          />
        </label>
        {error && <p className="sm:col-span-2 text-sm text-rose-600">{error}</p>}
        <div className="flex gap-3 sm:col-span-2">
          <button disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : id ? 'Update package' : 'Publish package'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/provider')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
