import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Gift, Ticket, ShoppingBag, Star, BarChart3, Shield, FileText, Database, Building2, Wallet, User, Settings, LogOut, BookOpen, Video, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route?: string;
  action?: () => void;
}

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const items: CommandItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, route: '/dashboard' },
    { id: 'members', label: 'Members', icon: <Users size={16} />, route: '/members' },
    { id: 'referral', label: 'Referrals', icon: <Gift size={16} />, route: '/referral' },
    { id: 'coupons', label: 'Coupons', icon: <ShoppingBag size={16} />, route: '/coupons' },
    { id: 'loyalty', label: 'Loyalty Points', icon: <Star size={16} />, route: '/loyalty' },
    { id: 'tickets', label: 'Support Tickets', icon: <Ticket size={16} />, route: '/tickets' },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={16} />, route: '/invoices' },
    { id: 'crm', label: 'CRM', icon: <Building2 size={16} />, route: '/crm' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} />, route: '/admin/analytics' },
    { id: 'revenue', label: 'Revenue', icon: <Wallet size={16} />, route: '/admin/revenue' },
    { id: 'audit', label: 'Audit Log', icon: <Database size={16} />, route: '/admin/audit' },
    { id: 'backup', label: 'Backups', icon: <Shield size={16} />, route: '/admin/backup' },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, route: '/settings' },
    { id: 'profile', label: 'Profile', icon: <User size={16} />, route: '/profile' },
    { id: 'video', label: 'Video Library', icon: <Video size={16} />, route: '/video' },
    { id: 'booking', label: 'Book Coach', icon: <BookOpen size={16} />, route: '/booking' },
    { id: 'workouts', label: 'Workouts', icon: <Dumbbell size={16} />, route: '/workouts' },
  ];

  const filtered = search.trim()
    ? items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleSelect = useCallback((item: CommandItem) => {
    setOpen(false);
    setSearch('');
    if (item.action) item.action();
    else if (item.route) navigate(item.route);
  }, [navigate]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 -translate-x-1/2 w-full max-w-lg animate-scale-in">
        <div className="bg-dark-850 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700">
            <Search size={18} className="text-dark-400 shrink-0" />
            <input
              autoFocus
              placeholder="Search pages, actions..."
              className="bg-transparent border-none outline-none text-white placeholder:text-dark-500 flex-1 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex text-xs text-dark-500 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-sm text-dark-500 text-center py-8">No results found</p>
            ) : (
              filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors text-left"
                >
                  <span className="text-dark-500">{item.icon}</span>
                  {item.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
