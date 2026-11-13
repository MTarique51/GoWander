import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import DiscoverMap from './pages/DiscoverMap';
import Auth from './pages/Auth';
import ListingDetail from './pages/ListingDetail';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import Provider from './pages/Provider';
import ListingForm from './pages/ListingForm';
import ProviderBookings from './pages/ProviderBookings';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ProviderApply from './pages/ProviderApply';
import Notifications from './pages/Notifications';
import WorkspacePage from './pages/WorkspacePage';
import { workspacePages } from './pages/workspaceConfig';
import PageDirectory from './pages/PageDirectory';
import BecomeProvider from './pages/BecomeProvider';

const roleFor = (section) =>
  section === 'Traveler'
    ? ['traveler']
    : section === 'Provider'
      ? ['provider']
      : section === 'Administration'
        ? ['admin']
        : undefined;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<DiscoverMap />} />
            <Route path="/workspace" element={<PageDirectory />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/provider/apply" element={<ProviderApply />} />
            </Route>
            <Route element={<ProtectedRoute roles={['traveler']} />}>
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route element={<ProtectedRoute roles={['traveler']} />}>
                <Route path="/become-provider" element={<BecomeProvider />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={['provider']} />}>
              <Route path="/provider" element={<Provider />} />
              <Route path="/provider/new" element={<ListingForm />} />
              <Route path="/provider/edit/:id" element={<ListingForm />} />
              <Route path="/provider/bookings" element={<ProviderBookings />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            {workspacePages.map((page) => {
              const roles = roleFor(page.section);
              const element = <WorkspacePage config={page} />;
              return roles ? (
                <Route key={page.path} element={<ProtectedRoute roles={roles} />}>
                  <Route path={page.path} element={element} />
                </Route>
              ) : (
                <Route key={page.path} path={page.path} element={element} />
              );
            })}
            <Route
              path="*"
              element={
                <div className="container-app py-24 text-center">
                  <h1 className="text-4xl font-extrabold">Page not found</h1>
                  <a className="mt-4 inline-block text-brand-700" href="/">
                    Return home
                  </a>
                </div>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
