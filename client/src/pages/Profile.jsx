import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound,
  Mail,
  Phone,
  Camera,
  BriefcaseBusiness,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const getInitialForm = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  bio: user?.bio || '',
  avatar: user?.avatar || '',
});

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState(() => getInitialForm(user));
  const [message, setMessage] = useState({
    type: '',
    text: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(user));
  }, [user]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage({ type: '', text: '' });
  };

  const handleReset = () => {
    setForm(getInitialForm(user));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your full name.',
      });
      return;
    }

    if (form.avatar.trim()) {
      try {
        new URL(form.avatar);
      } catch {
        setMessage({
          type: 'error',
          text: 'Please enter a valid avatar image URL.',
        });
        return;
      }
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { data } = await api.patch('/auth/profile', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
      });

      setUser(data.user);
      setForm(getInitialForm(data.user));

      setMessage({
        type: 'success',
        text: 'Your profile has been updated successfully.',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to update your profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.name || user?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-app max-w-5xl py-10 sm:py-14">
        {/* Page heading */}
        <div className="mb-8">
          <p className="eyebrow">Account settings</p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Your Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information and keep your GoWander account up to date.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-100 text-3xl font-bold text-brand-700 shadow-md">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-700 text-white">
                  <Camera size={16} />
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.name || 'Your name'}</h2>

              <p className="mt-1 break-all text-sm text-slate-500">{user?.email}</p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold capitalize text-brand-700">
                <ShieldCheck size={14} />
                {user?.role || 'Member'}
              </span>
            </div>

            {/* Account information */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account information
              </p>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 text-slate-400" />

                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Email address</p>
                    <p className="break-all text-sm font-medium text-slate-700">
                      {user?.email || 'Not available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BriefcaseBusiness size={17} className="mt-0.5 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">Account role</p>
                    <p className="text-sm font-medium capitalize text-slate-700">
                      {user?.role || 'Member'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Become a Provider - Travelers only */}
            {user?.role?.toLowerCase() === 'traveler' && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="rounded-xl bg-brand-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900">Become a Provider</h3>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Share your experiences, publish travel packages, and connect with travelers.
                  </p>

                  <Link
                    to="/become-provider"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
                  >
                    Apply Now
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </aside>

          {/* Profile form */}
          <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-bold text-slate-900">Personal information</h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the information associated with your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={80}
                    className="field pl-11"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    className="field cursor-not-allowed bg-slate-50 pl-11 text-slate-500"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Your email address cannot be changed here.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone number
                </label>

                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    maxLength={20}
                    className="field pl-11"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatar" className="mb-2 block text-sm font-semibold text-slate-700">
                  Profile image URL
                </label>

                <div className="relative">
                  <input
                    id="avatar"
                    type="url"
                    className="field pl-11"
                    placeholder="https://example.com/profile.jpg"
                    value={form.avatar}
                    onChange={(e) => updateField('avatar', e.target.value)}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Paste a publicly accessible image URL to update your profile picture.
                </p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-slate-700">
                  About you
                </label>

                <div className="relative">
                  <textarea
                    id="bio"
                    rows={5}
                    maxLength={500}
                    className="field resize-y pl-11"
                    placeholder="Tell us a little about yourself..."
                    value={form.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                  />
                </div>

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {form.bio.length}/500 characters
                </p>
              </div>

              {/* Success / Error message */}
              {message.text && (
                <div
                  role="status"
                  className={`flex items-start gap-3 rounded-xl p-4 text-sm ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  )}

                  <p>{message.text}</p>
                </div>
              )}

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reset changes
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
