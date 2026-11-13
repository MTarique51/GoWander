import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Users,
  TrendingUp,
  ShieldCheck,
  LoaderCircle,
  Globe,
} from 'lucide-react';
import api from '../lib/api';

const benefits = [
  {
    icon: Users,
    title: 'Reach more travelers',
    description: 'Connect with travelers searching for authentic local experiences.',
  },
  {
    icon: TrendingUp,
    title: 'Grow your business',
    description: 'Showcase your travel packages and reach a wider audience.',
  },
  {
    icon: MapPin,
    title: 'Promote local experiences',
    description: 'Help travelers discover experiences in your destination.',
  },
  {
    icon: ShieldCheck,
    title: 'Build your reputation',
    description: 'Create your provider profile and earn traveler trust through reviews.',
  },
];

const initialForm = {
  businessName: '',
  category: 'Adventure',
  experience: '',
  phone: '',
  website: '',
  description: '',
};

export default function BecomeProvider() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/providers/application', {
        ...form,
        experience: Number(form.experience),
      });

      setSuccess('Your application has been submitted successfully. Our team will review it.');

      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Something went wrong while submitting your application. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-20">
          <img
            src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1800&q=85"
            alt="Beautiful mountain travel destination"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />

        <div className="container-app py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              <BriefcaseBusiness size={15} />
              Become a GoWander Provider
            </div>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Share your world.
              <br />
              <span className="text-emerald-400">Inspire their journey.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Turn your local knowledge and passion for travel into unforgettable experiences.
              Connect with travelers and grow your experience business with GoWander.
            </p>

            <a
              href="#application"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-800"
            >
              Become a provider
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="container-app py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
            Why GoWander?
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Grow your travel business
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            We help local experts connect with travelers who want to experience destinations
            differently.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 font-bold text-slate-900">{benefit.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-100 bg-slate-50 py-16">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
              Simple process
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">How it works</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              {
                number: '01',
                title: 'Apply',
                description: 'Submit your provider application with your details.',
              },
              {
                number: '02',
                title: 'Get reviewed',
                description: 'Our administration team reviews your application.',
              },
              {
                number: '03',
                title: 'Create packages',
                description: 'After approval, publish your travel experiences.',
              },
              {
                number: '04',
                title: 'Welcome travelers',
                description: 'Connect with travelers and manage bookings.',
              },
            ].map((step) => (
              <div key={step.number}>
                <span className="text-3xl font-extrabold text-brand-700/30">{step.number}</span>

                <h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application section */}
      <section id="application" className="scroll-mt-20 py-16 sm:py-20">
        <div className="container-app grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left content */}
          <div className="lg:sticky lg:top-24">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
              Start your journey
            </span>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Let's make your experience available to the world.
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Complete the application form. Once submitted, our team will review your information
              and update your application status.
            </p>

            <div className="mt-9 space-y-5">
              {[
                'Submit your application',
                'Wait for administrator approval',
                'Create and publish your packages',
                'Start receiving traveler bookings',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />

                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex items-start gap-3 rounded-2xl bg-brand-50 p-5">
              <Globe className="mt-0.5 shrink-0 text-brand-700" size={21} />

              <div>
                <h3 className="text-sm font-bold text-slate-900">Your journey starts here</h3>
                <p className="mt-1 text-xs leading-6 text-slate-600">
                  Share what makes your destination special and help travelers discover something
                  new.
                </p>
              </div>
            </div>
          </div>

          {/* Application form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Provider application</h3>

              <p className="mt-2 text-sm text-slate-500">
                Tell us a little about yourself and your business.
              </p>
            </div>

            {success && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Business name */}
              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Business / Provider name
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Himalayan Adventures"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Experience category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                >
                  <option value="Adventure">Adventure</option>
                  <option value="Culture">Culture</option>
                  <option value="Food">Food</option>
                  <option value="Nature">Nature</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Years of experience
                </label>

                <input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  max="100"
                  value={form.experience}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 3"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Contact phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your contact number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />
              </div>

              {/* Website */}
              <div>
                <label
                  htmlFor="website"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Website <span className="font-normal text-slate-400">(Optional)</span>
                </label>

                <input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  About your business and experiences
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  required
                  minLength={20}
                  maxLength={2000}
                  placeholder="Tell us about your experience, services, destinations, and what makes your business special..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/2000
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Submitting application...
                  </>
                ) : (
                  <>
                    Submit application
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400">
                By submitting, you agree to provide accurate information for application review.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
