import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); toast.success('Welcome back!'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-3xl font-bold"><span className="text-primary-400">GYM</span>ER</h1><p className="text-dark-400 mt-2">Sign in to your account</p></div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div><label className="label">Email</label><input type="email" className="input mt-1" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label><input type="password" className="input mt-1" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-center text-dark-400 text-sm">Don't have an account? <Link to="/register" className="text-primary-400">Register</Link></p>
        </form>
      </div>
    </div>
  );
}
