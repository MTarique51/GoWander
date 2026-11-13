import { useEffect, useState } from 'react';
import {
  Search,
  Compass,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ListingCard from '../components/ListingCard';

const categories = [
  'adventure',
  'culture',
  'food',
  'nature',
  'wellness',
  'sightseeing',
  'workshop',
];

const PAGE_SIZE = 8;

export default function Home() {
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters and page number from URL.
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setCity(searchParams.get('city') || '');
    setCategory(searchParams.get('category') || '');

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch listings whenever filters or page change.
  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setLoading(true);
      setError('');

      try {
        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          sort: 'popular',
        };

        const q = searchParams.get('q');
        const selectedCity = searchParams.get('city');
        const selectedCategory = searchParams.get('category');

        if (q) params.q = q;
        if (selectedCity) params.city = selectedCity;
        if (selectedCategory) params.category = selectedCategory;

        const { data } = await api.get('/listings', { params });

        if (cancelled) return;

        setListings(data.items || []);
        setTotalListings(data.pagination?.total || 0);
        setTotalPages(Math.max(1, data.pagination?.pages || 1));

        // If the requested page is no longer valid, return to page 1.
        if (data.pagination?.pages > 0 && currentPage > data.pagination.pages) {
          setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set('page', '1');
            return next;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Unable to load experiences. Please try again.');
          setListings([]);
          setTotalListings(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, [currentPage, searchParams, setSearchParams]);

  // Search listings.
  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) params.set('q', query.trim());
    if (city.trim()) params.set('city', city.trim());
    if (category) params.set('category', category);

    params.set('page', '1');
    setSearchParams(params);
  }

  // Select a category.
  function handleCategorySelect(selectedCategory) {
    setCategory(selectedCategory);

    const params = new URLSearchParams(searchParams);

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    params.set('page', '1');
    setSearchParams(params);
  }

  // Change page without losing current filters.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));

    setSearchParams(params);

    window.scrollTo({
      top: document.querySelector('#listings-section')?.offsetTop || 0,
      behavior: 'smooth',
    });
  }

  // Generate a compact page-number list.
  function getPageNumbers() {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#102f2c] text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#102f2c] via-[#102f2c]/90 to-[#102f2c]/30" />

        <div className="container-app relative grid min-h-[570px] items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-emerald-100">
              <Sparkles size={14} />
              TRAVEL DEEPER, NOT JUST FARTHER
            </span>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              The world is better <span className="text-emerald-300">with a local.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              Discover small-group adventures, food walks, cultural gems and unforgettable moments
              hosted by people who call it home.
            </p>

            {/* SEARCH FORM */}
            <form
              onSubmit={handleSearch}
              className="mt-9 grid gap-2 rounded-2xl bg-white p-3 shadow-2xl sm:grid-cols-[1.3fr_1fr_1fr_auto]"
            >
              <div className="px-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  What interests you?
                </label>

                <input
                  className="w-full py-2 text-sm text-slate-900 outline-none"
                  placeholder="Hikes, food, culture..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="border-l border-slate-100 px-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Destination
                </label>

                <input
                  className="w-full py-2 text-sm text-slate-900 outline-none"
                  placeholder="City or region"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="border-l border-slate-100 px-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Experience
                </label>

                <select
                  className="w-full bg-white py-2 text-sm text-slate-900 outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All types</option>

                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary">
                <Search size={17} />
                Search
              </button>
            </form>
          </div>

          {/* HERO IMAGE */}
          <div className="hidden lg:block">
            <div className="relative ml-auto max-w-md">
              <img
                className="h-[430px] w-full rounded-[2rem] object-cover shadow-2xl"
                src="https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1000"
                alt="Traveler looking over a scenic landscape"
              />

              <div className="absolute -bottom-6 -left-12 rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
                <p className="text-xs font-semibold text-slate-500">TRAVEL THE LOCAL WAY</p>

                <p className="mt-1 text-2xl font-extrabold">Real places. Real people.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP DISCOVERY BANNER */}
      <section className="container-app py-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-emerald-50 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
              Explore by location
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Find local providers on an interactive map
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Search destinations and compare nearby guides, stays, food and transport.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="btn-primary whitespace-nowrap"
          >
            Explore providers <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="container-app py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curated for curious travelers</p>
            <h2 className="mt-2 text-3xl font-extrabold">Explore by experience</h2>
          </div>

          <button
            type="button"
            className="text-sm font-bold text-brand-700"
            onClick={() => handleCategorySelect('')}
          >
            View all experiences <ArrowRight className="ml-1 inline" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((c, i) => (
            <button
              type="button"
              key={c}
              onClick={() => handleCategorySelect(c)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:border-brand-300 hover:bg-brand-50 ${
                category === c ? 'border-brand-400 bg-brand-50' : 'border-slate-100 bg-white'
              }`}
            >
              <span className="text-2xl">{['🏔️', '🏛️', '🍜', '🌿', '🧘', '📸', '🎨'][i]}</span>

              <p className="mt-3 text-sm font-bold capitalize">{c}</p>
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS SECTION */}
      <section id="listings-section" className="container-app scroll-mt-8 pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Handpicked experiences</p>

            <h2 className="mt-2 text-3xl font-extrabold">Popular near and far</h2>

            <p className="mt-2 text-sm text-slate-500">
              Discover experiences from local hosts around the world.
            </p>
          </div>

          {!loading && (
            <span className="text-sm font-medium text-slate-500">
              {totalListings} experiences found
            </span>
          )}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white"
              >
                <div className="h-52 bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="card p-12 text-center">
            <p className="font-semibold text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => handlePageChange(currentPage)}
              className="btn-primary mt-5"
            >
              Try again
            </button>
          </div>
        ) : listings.length > 0 ? (
          <>
            {/* LISTING CARDS */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((item) => (
                <ListingCard
                  key={item._id}
                  listing={item}
                  favoriteIds={favoriteIds}
                  onFavorite={(id, add) =>
                    setFavoriteIds((old) => (add ? [...old, id] : old.filter((x) => x !== id)))
                  }
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-slate-100 pt-8 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  {' - '}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * PAGE_SIZE, totalListings)}
                  </span>
                  {' of '}
                  <span className="font-semibold text-slate-900">{totalListings}</span> experiences
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* PREVIOUS */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {/* FIRST PAGE */}
                  {getPageNumbers()[0] > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        className="h-10 min-w-10 rounded-xl border border-slate-200 text-sm font-semibold hover:border-brand-300"
                      >
                        1
                      </button>

                      {getPageNumbers()[0] > 2 && <span className="px-1 text-slate-400">...</span>}
                    </>
                  )}

                  {/* PAGE NUMBERS */}
                  {getPageNumbers().map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                      className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${
                        page === currentPage
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* LAST PAGE */}
                  {getPageNumbers().at(-1) < totalPages && (
                    <>
                      {getPageNumbers().at(-1) < totalPages - 1 && (
                        <span className="px-1 text-slate-400">...</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-10 min-w-10 rounded-xl border border-slate-200 text-sm font-semibold hover:border-brand-300"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* NEXT */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="card p-12 text-center">
            <Compass className="mx-auto mb-4 text-slate-400" size={36} />

            <h3 className="text-xl font-bold text-slate-900">No experiences found</h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCity('');
                setCategory('');
                setSearchParams({});
              }}
              className="btn-primary mt-5"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* PLATFORM BENEFITS */}
      <section className="container-app pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              Compass,
              'Experiences with meaning',
              'Go beyond the usual checklist with experiences designed by locals.',
            ],
            [
              ShieldCheck,
              'Hosts you can trust',
              'Every provider application is reviewed before listings go live.',
            ],
            [
              Sparkles,
              'Your kind of adventure',
              'Find food, culture, nature and adventure for every kind of traveler.',
            ],
          ].map(([Icon, title, desc]) => (
            <div className="card p-7" key={title}>
              <span className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon size={22} />
              </span>

              <h3 className="mt-5 text-lg font-extrabold">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
