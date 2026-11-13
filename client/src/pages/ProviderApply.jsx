import { useEffect, useState } from 'react';
import api from '../lib/api';
export default function ProviderApply() {
  const [form, setForm] = useState({
    businessName: '',
    description: '',
    experienceYears: 0,
    serviceAreas: '',
  });
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    api
      .get('/providers/application')
      .then(({ data }) => setStatus(data.application))
      .catch(() => {});
  }, []);
  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/providers/application', {
        ...form,
        serviceAreas: form.serviceAreas
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      });
      setStatus(data.application);
      setMessage('Application submitted for admin review.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit application.');
    }
  }
  return (
    <div className="container-app max-w-3xl py-12">
      <p className="eyebrow">Become a local host</p>
      <h1 className="mt-2 text-4xl font-extrabold">Share what makes your place special.</h1>
      <p className="mt-3 text-slate-500">
        Tell us about your business. An administrator must approve your application before you can
        publish experiences.
      </p>
      {status && (
        <div className="mt-6 rounded-2xl bg-brand-50 p-5 text-sm text-brand-800">
          Latest application status: <b className="capitalize">{status.status}</b>
          {status.adminNote && <p className="mt-1">Admin note: {status.adminNote}</p>}
        </div>
      )}
      {(!status || status.status === 'rejected') && (
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          <input
            className="field"
            placeholder="Business / host name"
            required
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
          <textarea
            className="field"
            rows="5"
            placeholder="Describe your experience and what travelers can expect"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="field"
            type="number"
            min="0"
            placeholder="Years of experience"
            value={form.experienceYears}
            onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
          />
          <input
            className="field"
            placeholder="Service areas (comma separated)"
            value={form.serviceAreas}
            onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })}
          />
          {message && <p className="text-sm text-brand-700">{message}</p>}
          <button className="btn-primary">Submit provider application</button>
        </form>
      )}
    </div>
  );
}
