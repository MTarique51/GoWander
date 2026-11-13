import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Compass,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workspacePages } from './workspaceConfig';

const sectionIcons = {
  Traveler: UserRound,
  Provider: BriefcaseBusiness,
  Administration: ShieldCheck,
  Explore: Compass,
  Public: Globe2,
  Legal: ShieldCheck,
};

export default function PageDirectory() {
  const { user } = useAuth();
  const allowed = workspacePages.filter((page) => {
    if (['Public', 'Legal', 'Explore'].includes(page.section)) return true;
    if (!user) return false;
    return page.section.toLowerCase() === user.role;
  });
  const groups = [...new Set(allowed.map((page) => page.section))];

  return (
    <div className="container-app py-10">
      <p className="eyebrow">GoWander sitemap</p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Your workspace</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Open the tools available to your account. Role-specific areas are protected and only appear
        for the matching signed-in role.
      </p>
      <div className="mt-8 space-y-8">
        {groups.map((group) => {
          const Icon = sectionIcons[group] || Compass;
          return (
            <section key={group}>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <Icon size={17} /> {group}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {allowed
                  .filter((page) => page.section === group)
                  .map((page) => (
                    <Link
                      key={page.path}
                      to={page.path}
                      className="card group flex items-start justify-between p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
                    >
                      <div>
                        <h2 className="font-bold text-slate-900">{page.title}</h2>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{page.description}</p>
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-slate-300 transition group-hover:text-brand-700"
                      />
                    </Link>
                  ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
