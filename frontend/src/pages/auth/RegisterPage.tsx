import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', referral_code: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/auth/register', form); toast.success('Registered! Please login.'); navigate('/login'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold"><span className="text-primary-400">GYM</span>ER</h1><p className="text-dark-400 mt-2">Create your account</p></div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div><label className="label">Full Name</label><input className="input mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="label">Email</label><input type="email" className="input mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="label">Password</label><input type="password" className="input mt-1" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} /></div>
          <div><label className="label">Phone</label><input className="input mt-1" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="label">Referral Code (optional)</label><input className="input mt-1" value={form.referral_code} onChange={e => setForm({...form, referral_code: e.target.value})} /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Registering...' : 'Create Account'}</button>
          <p className="text-center text-dark-400 text-sm">Already have an account? <Link to="/login" className="text-primary-400">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
