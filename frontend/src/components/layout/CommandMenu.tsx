import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, Gift, ShoppingBag, Star, Ticket, FileText, Building2, Shield, BarChart3, Wallet, Database, Settings } from 'lucide-react';

const allLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/referral', icon: Gift, label: 'Referral' },
  { to: '/coupons', icon: ShoppingBag, label: 'Coupons' },
  { to: '/loyalty', icon: Star, label: 'Loyalty Points' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/crm', icon: Building2, label: 'CRM' },
  { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/revenue', icon: Wallet, label: 'Revenue' },
  { to: '/admin/audit', icon: Database, label: 'Audit Log' },
  { to: '/admin/backup', icon: Database, label: 'Backup' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = allLinks.filter(l => l.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = useCallback((to: string) => {
    setOpen(false); setSearch(''); navigate(to);
  }, [navigate]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center pt-[15vh]'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={() => setOpen(false)} />
      <div className='relative w-full max-w-lg bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in' role='dialog' aria-modal='true'>
        <div className='flex items-center gap-3 px-4 py-3 border-b border-[#1e293b]'>
          <Search size={18} className='text-[#64748B]' />
          <input className='flex-1 bg-transparent text-white placeholder:text-[#64748B] outline-none text-sm' placeholder='Search pages...' value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          <kbd className='hidden sm:inline-flex text-xs text-[#64748B] bg-[#1e293b] px-1.5 py-0.5 rounded'>ESC</kbd>
        </div>
        <div className='max-h-72 overflow-y-auto p-2'>
          {filtered.length === 0 && <p className='text-center text-sm text-[#64748B] py-8'>No results</p>}
          {filtered.map(l => (
            <button key={l.to} onClick={() => handleSelect(l.to)} className='flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white hover:bg-[#1e293b] transition-colors text-left'>
              <l.icon size={16} className='text-[#64748B]' />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
