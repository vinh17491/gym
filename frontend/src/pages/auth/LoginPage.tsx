import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Left - Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-dark-900 via-dark-850 to-dark-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/30">
            <span className="text-white font-bold text-4xl">G</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Gymer</h1>
          <p className="text-dark-400 text-lg">Enterprise Gym Management</p>
          <div className="mt-8 flex justify-center gap-8">
            <div><p className="text-2xl font-bold text-primary-400">500+</p><p className="text-xs text-dark-500">Members</p></div>
            <div><p className="text-2xl font-bold text-primary-400">50+</p><p className="text-xs text-dark-500">Coaches</p></div>
            <div><p className="text-2xl font-bold text-primary-400">10K+</p><p className="text-xs text-dark-500">Workouts</p></div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-dark-400 mt-1">Sign in to your account</p>
          </div>
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-dark-400 mt-1">Sign in to continue to Gymer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={<Mail size={16} />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                icon={<Lock size={16} />}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-[38px] text-dark-500 hover:text-dark-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-dark-400 cursor-pointer">
                <input type="checkbox" className="rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <button type="button" className="text-primary-400 hover:text-primary-300">Forgot password?</button>
            </div>
            <Button type="submit" loading={loading} className="w-full" icon={<LogIn size={16} />}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
          </p>

          <div className="mt-8 p-4 bg-dark-800/50 rounded-lg border border-dark-700/50">
            <p className="text-xs text-dark-500 text-center">Demo: admin@gymer.com / admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
