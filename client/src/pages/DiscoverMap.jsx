// client/src/pages/DiscoverMap.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';

import L from 'leaflet';

import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPinned,
  LocateFixed,
  LoaderCircle,
  UserRound,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';

import api from '../lib/api';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [20, 80];
const DEFAULT_ZOOM = 4.5;

const markerIcon = L.divIcon({
  className: 'gowander-map-marker',
  html: `
    <div style="
      background:#047857;
      border:3px solid white;
      width:28px;
      height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px #0005;
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const centerIcon = L.divIcon({
  className: 'gowander-search-center',
  html: `
    <div style="
      width:20px;
      height:20px;
      background:#2563eb;
      border:4px solid white;
      border-radius:50%;
      box-shadow:0 1px 8px #0008;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapSync({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

function MapPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function getCoordinates(pkg) {
  const coordinates = pkg?.location?.geo?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return [lat, lng];
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold disabled:opacity-40"
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        {pages.map((number) => (
          <button
            type="button"
            key={number}
            onClick={() => onPageChange(number)}
            className={`h-9 min-w-9 rounded-lg px-3 text-xs font-bold ${
              number === page
                ? 'bg-emerald-700 text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold disabled:opacity-40"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function ProviderAvatar({ provider, size = 'large' }) {
  const dimensions = size === 'small' ? 'h-12 w-12' : 'h-16 w-16';

  if (provider?.avatar) {
    return (
      <img
        src={provider.avatar}
        alt={provider.name || 'Provider'}
        className={`${dimensions} rounded-2xl border border-slate-100 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700`}
    >
      <UserRound size={size === 'small' ? 22 : 28} />
    </div>
  );
}

function PackageCard({ pkg }) {
  const image = pkg.images?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      {image ? (
        <img
          src={image}
          alt={pkg.title || 'Travel package'}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-44 items-center justify-center bg-slate-100 text-slate-400">
          <Package size={36} />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
            {pkg.category || 'Travel'}
          </span>

          {pkg.duration && <span className="text-xs text-slate-400">{pkg.duration}</span>}
        </div>

        <h4 className="mt-3 line-clamp-1 font-extrabold text-slate-900">{pkg.title}</h4>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} className="shrink-0 text-emerald-700" />
          {[pkg.location?.city, pkg.location?.state].filter(Boolean).join(', ') ||
            'Location not specified'}
        </p>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {pkg.shortDescription || pkg.description || 'Explore this travel experience.'}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] text-slate-400">Starting from</p>

            <p className="font-extrabold text-emerald-800">
              ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
              <span className="ml-1 text-xs font-normal text-slate-400">/ guest</span>
            </p>
          </div>

          <Link
            to={`/listings/${pkg._id}`}
            className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DiscoverMap() {
  // All published package locations shown on the default map.
  const [allLocations, setAllLocations] = useState([]);
  const [mapLocationsLoading, setMapLocationsLoading] = useState(true);

  // Provider directory.
  const [providers, setProviders] = useState([]);
  const [directoryPagination, setDirectoryPagination] = useState(null);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  // Location search.
  const [searchMode, setSearchMode] = useState(false);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [place, setPlace] = useState('');
  const [radius, setRadius] = useState(25);
  const [category, setCategory] = useState('all');

  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // Provider profile.
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profilePagination, setProfilePagination] = useState(null);
  const [profilePage, setProfilePage] = useState(1);
  const [profileLoading, setProfileLoading] = useState(false);

  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'all',
    'adventure',
    'culture',
    'food',
    'nature',
    'wellness',
    'sightseeing',
    'workshop',
    'other',
  ];

  // Load the complete map dataset.
  const loadAllMapLocations = useCallback(async () => {
    setMapLocationsLoading(true);

    try {
      const { data } = await api.get('/listings/map/locations');

      setAllLocations(data.locations || []);
    } catch (err) {
      console.error('Map locations error:', err);
      setAllLocations([]);
      setError(err.response?.data?.message || 'Could not load package locations on the map.');
    } finally {
      setMapLocationsLoading(false);
    }
  }, []);

  // Load paginated provider directory.
  const loadDirectory = useCallback(async (page = 1) => {
    setDirectoryLoading(true);
    setError('');

    try {
      const { data } = await api.get('/providers/directory', {
        params: {
          page,
          limit: 3,
        },
      });

      setProviders(data.providers || []);
      setDirectoryPagination(data.pagination || null);
    } catch (err) {
      console.error('Provider directory error:', err);
      setProviders([]);

      setError(err.response?.data?.message || 'Could not load providers. Please check the server.');
    } finally {
      setDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectory(1);
    loadAllMapLocations();
  }, [loadDirectory, loadAllMapLocations]);

  // Load nearby providers after a location is selected.
  const loadNearby = useCallback(async (point, range, selectedCategory) => {
    setNearbyLoading(true);
    setError('');

    try {
      const { data } = await api.get('/listings/nearby/providers', {
        params: {
          lat: point[0],
          lng: point[1],
          radiusKm: range,
        },
      });

      let results = data.providers || [];

      if (selectedCategory !== 'all') {
        results = results
          .map((item) => ({
            ...item,
            nearbyPackages: (item.nearbyPackages || []).filter(
              (pkg) => pkg.category === selectedCategory,
            ),
          }))
          .filter((item) => item.nearbyPackages.length > 0);
      }

      setNearbyProviders(results);
    } catch (err) {
      console.error('Nearby providers error:', err);
      setNearbyProviders([]);

      setError(err.response?.data?.message || 'Could not load nearby providers.');
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchMode) return;

    loadNearby(center, radius, category);
  }, [searchMode, center, radius, category, loadNearby]);

  // Search a saved package location.
  async function searchLocation(event) {
    event.preventDefault();

    if (!place.trim()) {
      setError('Enter a location to search.');
      return;
    }

    setError('');

    try {
      const { data } = await api.get('/listings/locations/search', {
        params: {
          q: place.trim().split(',')[0].trim(),
        },
      });

      const locations = data.locations || [];

      if (!locations.length) {
        setError(
          'No saved package location matched your search. You can also click directly on the map.',
        );
        return;
      }

      const found = locations[0];

      setPlace([found.city, found.state].filter(Boolean).join(', '));

      setCenter([Number(found.lat), Number(found.lng)]);
      setZoom(12);
      setSearchMode(true);

      setSelectedProvider(null);
      setProfile(null);
      setProfilePage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Location search failed.');
    }
  }

  // Selecting any point on the map starts nearby search.
  function pickPoint(point) {
    setCenter([point.lat, point.lng]);

    setPlace(`Map point (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`);

    setZoom(12);
    setSearchMode(true);

    setSelectedProvider(null);
    setProfile(null);
    setProfilePage(1);
    setError('');
  }

  // Load a provider's profile and paginated package catalogue.
  const openProvider = useCallback(async (provider, page = 1) => {
    const providerId = provider?._id;

    if (!providerId) {
      setError('Provider ID is missing.');
      return;
    }

    setSelectedProvider(provider);
    setProfileLoading(true);
    setProfile(null);
    setProfilePagination(null);
    setProfilePage(page);
    setError('');

    try {
      const { data } = await api.get(`/providers/${providerId}/profile`, {
        params: {
          page,
          limit: 6,
        },
      });

      setProfile(data);
      setProfilePagination(data.pagination || null);
    } catch (err) {
      console.error('Provider profile error:', err);

      setError(err.response?.data?.message || 'Could not load this provider profile.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  function closeProvider() {
    setSelectedProvider(null);
    setProfile(null);
    setProfilePagination(null);
    setProfilePage(1);
  }

  // Return to the default directory and show all map markers again.
  function resetToDirectory() {
    setSearchMode(false);
    setCenter(DEFAULT_CENTER);
    setZoom(DEFAULT_ZOOM);
    setPlace('');
    setNearbyProviders([]);
    setSelectedProvider(null);
    setProfile(null);
    setProfilePagination(null);
    setProfilePage(1);
    setCategory('all');
    setError('');

    loadDirectory(1);
    loadAllMapLocations();
  }

  // Nearby results are grouped by provider. Convert them to
  // individual package markers for the map.
  const nearbyMarkers = useMemo(() => {
    return nearbyProviders.flatMap((item) =>
      (item.nearbyPackages || []).map((pkg) => ({
        pkg,
        provider: item.provider,
      })),
    );
  }, [nearbyProviders]);

  // Default map markers come from all published package locations.
  // Each location document should contain a populated provider.
  const defaultMarkers = useMemo(() => {
    return allLocations
      .map((pkg) => ({
        pkg,
        provider: pkg.provider,
      }))
      .filter(
        (item) => getCoordinates(item.pkg) && item.provider && typeof item.provider === 'object',
      );
  }, [allLocations]);

  const markers = searchMode ? nearbyMarkers : defaultMarkers;

  const displayedProviders = searchMode
    ? nearbyProviders.map((item) => ({
        ...item.provider,
        nearbyPackageCount: item.nearbyPackageCount || item.nearbyPackages?.length || 0,
        nearestDistanceKm: item.nearestDistanceKm,
        nearbyPackages: item.nearbyPackages,
      }))
    : providers;

  const displayedLoading = searchMode ? nearbyLoading : directoryLoading;

  const displayedCount = searchMode
    ? nearbyProviders.length
    : (directoryPagination?.total ?? providers.length);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f8f7]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-app py-7">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-emerald-700">
            GoWander marketplace
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Discover travel providers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore approved providers and their travel packages. Browse package locations on
                the map or search for experiences near a destination.
              </p>
            </div>

            <form onSubmit={searchLocation} className="flex w-full gap-2 lg:max-w-xl">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3.5 text-emerald-700" size={18} />

                <input
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  placeholder="Search city, state or area"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="flex h-12 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                <Search size={17} />
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container-app py-6">
        {/* Summary and controls */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900">
                {searchMode ? 'Nearby providers' : 'All providers'}
              </h2>

              {searchMode && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  Location search
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {displayedLoading
                ? 'Loading providers...'
                : `${displayedCount} provider${displayedCount === 1 ? '' : 's'} found`}
              {searchMode && place ? ` near ${place}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchMode && (
              <>
                <label className="text-xs font-semibold text-slate-500">Radius</label>

                <select
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {[5, 10, 25, 50, 100].map((value) => (
                    <option key={value} value={value}>
                      {value} km
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {searchMode && (
              <button
                type="button"
                onClick={resetToDirectory}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <X size={15} />
                Clear location
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block max-w-sm text-xs font-bold text-slate-600">
              Package category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field mt-2"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all'
                      ? 'All categories'
                      : item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            {!searchMode && (
              <p className="mt-2 text-xs text-slate-400">
                Category filtering applies to nearby search results.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p>{error}</p>

            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Provider directory and map */}
        <div className="grid gap-5 xl:grid-cols-[minmax(340px,.9fr)_minmax(480px,1.35fr)]">
          {/* Provider list */}
          <section className="order-2 space-y-4 xl:order-1">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">
                {searchMode ? 'Providers near your location' : 'Explore providers'}
              </h3>

              <span className="text-xs text-slate-500">
                {displayedLoading ? 'Loading...' : `${displayedCount} total`}
              </span>
            </div>

            {displayedLoading ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="text-center">
                  <LoaderCircle className="mx-auto animate-spin text-emerald-700" size={30} />
                  <p className="mt-3 text-sm text-slate-500">Loading providers...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedProviders.map((provider) => (
                  <button
                    type="button"
                    key={provider._id}
                    onClick={() => openProvider(provider, 1)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                      selectedProvider?._id === provider._id
                        ? 'border-emerald-500 ring-2 ring-emerald-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ProviderAvatar provider={provider} size="small" />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-extrabold text-slate-900">{provider.name}</h4>

                          {searchMode && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                              {provider.nearestDistanceKm != null
                                ? `${Number(provider.nearestDistanceKm).toFixed(1)} km away`
                                : 'Nearby'}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {provider.bio || 'Travel experience provider'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                            <Package size={12} />
                            {searchMode
                              ? provider.nearbyPackageCount || provider.nearbyPackages?.length || 0
                              : provider.packageCount || 0}{' '}
                            {searchMode ? 'nearby packages' : 'packages'}
                          </span>

                          {searchMode &&
                            provider.nearbyPackages?.slice(0, 2).map((pkg) => (
                              <span
                                key={pkg._id}
                                className="max-w-36 truncate rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-500"
                              >
                                {pkg.title}
                              </span>
                            ))}
                        </div>

                        <p className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-800">
                          View profile and all packages
                          <ArrowRight size={13} />
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {!displayedProviders.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <Users className="mx-auto text-slate-300" size={32} />

                    <p className="mt-3 font-bold text-slate-700">
                      {searchMode ? 'No providers found in this range' : 'No providers available'}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {searchMode
                        ? 'Try increasing the radius or selecting another location.'
                        : 'Approved providers with published packages will appear here.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!searchMode && !directoryLoading && (
              <Pagination pagination={directoryPagination} onPageChange={loadDirectory} />
            )}
          </section>

          {/* Map */}
          <section className="order-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <MapPinned size={17} className="text-emerald-700" />
                Package locations
              </div>

              <span className="text-[11px] text-slate-500">
                Click anywhere on the map to search nearby
              </span>
            </div>

            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="h-[490px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapSync center={center} zoom={zoom} />
              <MapPicker onPick={pickPoint} />

              {searchMode && (
                <Marker position={center} icon={centerIcon}>
                  <Popup>Selected search location</Popup>
                </Marker>
              )}

              {markers.map(({ pkg, provider }) => {
                const position = getCoordinates(pkg);

                if (!position) return null;

                return (
                  <Marker key={pkg._id} position={position} icon={markerIcon}>
                    <Popup>
                      <div className="min-w-[190px]">
                        <strong>{pkg.title}</strong>

                        <p className="mt-1 text-xs text-slate-600">
                          {provider?.name}
                          {pkg.location?.city ? ` · ${pkg.location.city}` : ''}
                        </p>

                        <p className="mt-1 text-xs">
                          ₹{Number(pkg.price || 0).toLocaleString('en-IN')} / guest
                        </p>

                        {provider?._id && (
                          <button
                            type="button"
                            className="mt-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
                            onClick={() => openProvider(provider, 1)}
                          >
                            View provider
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <span>
                {searchMode
                  ? `${markers.length} nearby package locations`
                  : mapLocationsLoading
                    ? 'Loading all package locations...'
                    : `${markers.length} package locations on map`}
              </span>

              {searchMode && (
                <button
                  type="button"
                  onClick={resetToDirectory}
                  className="flex items-center gap-1 font-bold text-emerald-800"
                >
                  <LocateFixed size={14} />
                  Show all locations
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Selected provider profile */}
        {selectedProvider && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <ProviderAvatar provider={profile?.provider || selectedProvider} />

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-emerald-700">
                      Provider profile
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                      {profile?.provider?.name || selectedProvider.name}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {profile?.provider?.bio ||
                        selectedProvider.bio ||
                        'This provider offers travel experiences and packages.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeProvider}
                  aria-label="Close provider profile"
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={19} />
                </button>
              </div>

              {profile?.provider && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  {profile.provider.email && (
                    <span className="flex items-center gap-2">
                      <Mail size={14} className="text-emerald-700" />
                      {profile.provider.email}
                    </span>
                  )}

                  {profile.provider.phone && (
                    <span className="flex items-center gap-2">
                      <Phone size={14} className="text-emerald-700" />
                      {profile.provider.phone}
                    </span>
                  )}

                  {profile.provider.website && (
                    <a
                      href={profile.provider.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-emerald-800 hover:underline"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">All packages</h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Packages from every city offered by this provider.
                  </p>
                </div>

                {profilePagination && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    {profilePagination.total} published packages
                  </span>
                )}
              </div>

              {profileLoading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <div className="text-center">
                    <LoaderCircle className="mx-auto animate-spin text-emerald-700" size={30} />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading provider profile and packages...
                    </p>
                  </div>
                </div>
              ) : profile ? (
                <>
                  {profile.packages?.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.packages.map((pkg) => (
                        <PackageCard key={pkg._id} pkg={pkg} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                      <Package className="mx-auto text-slate-300" size={30} />
                      <p className="mt-3 font-bold text-slate-700">No published packages</p>
                    </div>
                  )}

                  <Pagination
                    pagination={profilePagination}
                    onPageChange={(page) => openProvider(selectedProvider, page)}
                  />
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">Could not load this provider's packages.</p>

                  <button
                    type="button"
                    onClick={() => openProvider(selectedProvider, profilePage)}
                    className="mt-3 text-sm font-bold text-emerald-800"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-400">
          Provider and package information is loaded from your GoWander database. Map tiles are ©
          OpenStreetMap contributors.
        </p>
      </main>
    </div>
  );
}
