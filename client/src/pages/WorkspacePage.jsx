import { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Download,
  SlidersHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CircleAlert,
} from 'lucide-react';

const samples = {
  trips: [
    ['Rajasthan heritage trail', 'Jaipur · 5 days', 'Planning'],
    ['Coastal Kerala escape', 'Kochi · 4 days', 'Upcoming'],
    ['Old Delhi food walk', 'Delhi · 1 day', 'Completed'],
  ],
  calendar: [
    ['Sunrise fort walk', 'Nov 18, 2026 · 06:00', 'Confirmed'],
    ['Blue city photo tour', 'Nov 20, 2026 · 16:30', 'Pending'],
    ['Desert camp experience', 'Nov 22, 2026 · 18:00', 'Confirmed'],
  ],
  users: [
    ['Aarav Sharma', 'aarav@example.demo', 'Traveler'],
    ['Sara Khan', 'sara@example.demo', 'Provider'],
    ['Kabir Das', 'kabir@example.demo', 'Traveler'],
  ],
  listings: [
    ['Hidden Jaipur heritage walk', 'Jaipur · Culture', 'Published'],
    ['Western Ghats waterfall trek', 'Wayanad · Adventure', 'Review'],
    ['Varanasi sunrise boat ride', 'Varanasi · Water', 'Published'],
  ],
  bookings: [
    ['GW-2026-1042', 'Hidden Jaipur heritage walk', 'Confirmed'],
    ['GW-2026-1043', 'Old Delhi food walk', 'Pending'],
    ['GW-2026-1044', 'Coastal Kerala escape', 'Completed'],
  ],
  reviews: [
    ['A wonderful local experience', '5.0 · Jaipur', 'Visible'],
    ['Guide arrived late', '3.0 · Delhi', 'Flagged'],
    ['Excellent photography tips', '4.8 · Jodhpur', 'Visible'],
  ],
  providers: [
    ['Desert Trails Co.', 'Jaipur, Rajasthan', 'Pending'],
    ['Maya Experiences', 'Kochi, Kerala', 'Approved'],
    ['Himalayan Footprints', 'Dehradun, Uttarakhand', 'Needs review'],
  ],
  tickets: [
    ['Unable to change booking date', 'Booking · #GW-1042', 'Open'],
    ['Provider verification query', 'Verification · #PV-021', 'In progress'],
    ['Refund status question', 'Payments · #GW-0991', 'Resolved'],
  ],
  payouts: [
    ['November settlement', '₹42,500', 'Processing'],
    ['October settlement', '₹36,200', 'Paid'],
    ['September settlement', '₹28,750', 'Paid'],
  ],
  categories: [
    ['Adventure', 'Trekking, rafting, outdoors', 'Active'],
    ['Culture', 'Heritage, museums, local life', 'Active'],
    ['Food', 'Cooking classes, food walks', 'Active'],
  ],
};
const defaults = [
  ['Experience record', 'Details and metadata', 'Active'],
  ['New request', 'Awaiting review', 'Pending'],
  ['Recent update', 'Last modified today', 'Complete'],
];

export default function WorkspacePage({ config }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const rows = samples[config.data] || defaults;
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.join(' ').toLowerCase().includes(query.toLowerCase()) &&
          (filter === 'All' || row[2] === filter),
      ),
    [rows, query, filter],
  );
  const statuses = ['All', ...new Set(rows.map((row) => row[2]))];
  return (
    <div className="container-app py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">{config.section || 'GoWander workspace'}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {config.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
        </div>
        {config.action && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={17} />
            {config.action}
          </button>
        )}
      </div>
      {notice && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          config.stats || [
            ['Total records', '128'],
            ['Awaiting action', '12'],
            ['Completed this month', '86'],
            ['Satisfaction', '4.8/5'],
          ]
        ).map(([label, value], i) => (
          <div className="card p-5" key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-emerald-700">
              {i === 1 ? 'Requires attention' : 'Updated recently'}
            </p>
          </div>
        ))}
      </div>
      {showForm && (
        <form
          className="card mb-6 grid gap-3 p-5 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            setNotice(
              'Your entry has been captured in this demo workspace. Connect the matching API to persist it in MongoDB.',
            );
            setShowForm(false);
          }}
        >
          <div className="md:col-span-3">
            <h2 className="font-bold text-slate-900">{config.action} — quick entry</h2>
            <p className="mt-1 text-xs text-slate-500">
              Demo form. Existing core modules save through the API; this extension screen is ready
              for endpoint integration.
            </p>
          </div>
          <input required className="field" placeholder="Name / title" />
          <input className="field" placeholder="Description / reference" />
          <select className="field">
            <option>Active</option>
            <option>Pending</option>
            <option>Draft</option>
          </select>
          <button className="btn-primary md:col-span-3">Save entry</button>
        </form>
      )}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">{config.tableTitle || 'Recent records'}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Search, filter and review workspace records.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                className="field !py-2.5 !pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search records..."
              />
            </div>
            <select
              className="field !py-2.5"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {statuses.slice(1).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              className="btn-secondary"
              onClick={() =>
                setNotice(
                  'Export is available after connecting this workspace to its production data endpoint.',
                )
              }
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4">{config.columns?.[0] || 'Name'}</th>
                <th className="px-5 py-4">{config.columns?.[1] || 'Details'}</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-slate-800">{r[0]}</td>
                  <td className="px-5 py-4 text-slate-500">{r[1]}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {r[2]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="font-semibold text-brand-700 hover:underline"
                      onClick={() =>
                        setNotice(
                          `Selected: ${r[0]}. Detailed record actions are enabled in the core workflow or can be connected to the relevant API.`,
                        )
                      }
                    >
                      View details <ArrowUpRight className="ml-1 inline" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center text-slate-400">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
          <span>
            Showing {filtered.length} of {rows.length} demo records
          </span>
          <span>GoWander management workspace</span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <CheckCircle2 className="text-emerald-600" size={18} />
            Workflow guidance
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {config.guidance ||
              'Use the filters above to find records and review their current status. Role-based access is enforced by the application routes.'}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <CircleAlert className="text-amber-500" size={18} />
            Implementation note
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This is an advanced extension workspace. Demo rows are illustrative; do not treat them
            as persisted production records until the corresponding API integration is configured.
          </p>
        </div>
      </div>
    </div>
  );
}
