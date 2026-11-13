import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Bell,
  BriefcaseBusiness,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    ['Explore', '/', Compass],
    ['Find providers', '/discover', Compass],
    ...(user?.role === 'traveler'
      ? [
          ['Favorites', '/favorites', Heart],
          ['My bookings', '/bookings', BriefcaseBusiness],
        ]
      : []),
    ...(user?.role === 'provider'
      ? [
          ['Provider dashboard', '/provider', LayoutDashboard],
          ['My bookings', '/provider/bookings', BriefcaseBusiness],
        ]
      : []),
    ...(user?.role === 'admin' ? [['Admin dashboard', '/admin', LayoutDashboard]] : []),
    // ...(user ? [['Workspace', '/workspace', LayoutDashboard]] : []),
  ];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="container-app flex h-20 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white">
              <Compass size={22} />
            </span>
            Go<span className="text-brand-600">Wander</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `text-sm font-semibold ${isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-900'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to="/notifications" className="btn-secondary !rounded-full !p-3">
                  <Bell size={17} />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-4 text-sm font-semibold"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <UserRound size={16} />
                  </span>
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  className="text-slate-400 hover:text-rose-600"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  aria-label="Logout"
                >
                  <LogOut size={19} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !py-2.5">
                  Get started
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <Menu />
          </button>
        </div>
        {open && (
          <div className="border-t bg-white p-4 md:hidden">
            {links.map(([label, path]) => (
              <Link
                key={path}
                className="block py-2 text-sm"
                to={path}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <button
                className="py-2 text-sm text-rose-600"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Log out
              </button>
            ) : (
              <Link to="/login" className="block py-2">
                Log in
              </Link>
            )}
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-7 sm:flex-row">
          <div>
            <Link to="/" className="text-xl font-extrabold text-slate-900">
              Go<span className="text-brand-700">Wander</span>
            </Link>
            <p className="mt-1 text-sm text-slate-500">
              Find meaningful experiences, guided by locals.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GoWander. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
