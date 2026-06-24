import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Gift, Ticket, ShoppingBag, Star, BarChart3, Settings, LogOut, Wallet, Shield, FileText, Database, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/referral', icon: Gift, label: 'Referral' },
  { to: '/coupons', icon: ShoppingBag, label: 'Coupons' },
  { to: '/loyalty', icon: Star, label: 'Loyalty Points' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/crm', icon: Building2, label: 'CRM' },
  { to: '/admin', icon: Shield, label: 'Admin', admin: true },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', admin: true },
  { to: '/admin/revenue', icon: Wallet, label: 'Revenue', admin: true },
  { to: '/admin/audit', icon: Database, label: 'Audit Log', admin: true },
  { to: '/admin/backup', icon: Shield, label: 'Backup', admin: true },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col h-full">
      <div className="p-6 border-b border-dark-700">
        <h1 className="text-xl font-bold"><span className="text-primary-400">GYM</span>ER</h1>
        <p className="text-xs text-dark-400 mt-1">Enterprise Management</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {links.filter(l => !l.admin || user?.role === 'admin').map(l => (
          <NavLink key={l.to} to={l.to} onClick={onClose} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}>
            <l.icon size={18} /><span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium">{user?.name?.[0]}</div>
          <div><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-dark-400 capitalize">{user?.role}</p></div>
        </div>
        <button onClick={logout} className="sidebar-link w-full"><LogOut size={18} /><span>Logout</span></button>
      </div>
    </aside>
  );
}
