export default function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
