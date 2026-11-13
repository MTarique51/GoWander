import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = isRegister
        ? await register(form)
        : await login({ email: form.email, password: form.password });
      navigate(user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/provider' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container-app grid min-h-[75vh] items-center py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xl font-extrabold">
          <span className="rounded-xl bg-brand-600 p-2 text-white">
            <Compass size={20} />
          </span>
          GoWander
        </Link>
        <p className="eyebrow">{isRegister ? 'Start exploring' : 'Welcome back'}</p>
        <h1 className="mt-2 text-4xl font-extrabold">
          {isRegister ? 'Create your account' : 'Sign in to GoWander'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {isRegister
            ? 'Join a community of travelers and local experience hosts.'
            : 'Your next meaningful experience is waiting.'}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {isRegister && (
            <>
              <input
                className="field"
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="field"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </>
          )}
          <input
            className="field"
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="field"
            type="password"
            placeholder="Password (8+ characters)"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Already have an account?' : 'New to GoWander?'}{' '}
          <Link className="font-bold text-brand-700" to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Log in' : 'Create account'}
          </Link>
        </p>
      </div>
      <div className="hidden h-[560px] overflow-hidden rounded-[2rem] lg:block">
        <img
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200"
          alt="Beautiful alpine lake"
        />
      </div>
    </div>
  );
}
