import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Gift } from 'lucide-react';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', referral_code: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-950">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-900 via-dark-850 to-dark-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/30">
            <span className="text-white font-bold text-4xl">G</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Join Gymer</h1>
          <p className="text-dark-400 text-lg">Start your fitness journey today</p>
          <div className="mt-8 space-y-4 text-left max-w-xs mx-auto">
            {['Personalized workout plans', 'Expert coach guidance', 'Track your progress', 'Community support'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-dark-300">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Create account</h2>
            <p className="text-dark-400 mt-1">Start your fitness journey</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" icon={<User size={16} />} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
            <Input label="Email" type="email" icon={<Mail size={16} />} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
            <Input label="Password" type="password" icon={<Lock size={16} />} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 8 characters" required minLength={8} />
            <Input label="Phone" icon={<Phone size={16} />} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            <Input label="Referral Code (optional)" icon={<Gift size={16} />} value={form.referral_code} onChange={e => setForm({...form, referral_code: e.target.value})} placeholder="Enter code" />
            <Button type="submit" loading={loading} className="w-full" icon={<UserPlus size={16} />}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
