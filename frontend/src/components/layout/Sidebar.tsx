import { Activity, BarChart3, Boxes, Calendar, ChevronDown, ClipboardList, Dumbbell, FileText, Gift, LayoutDashboard, LogOut, Package, Settings, Shield, ShoppingCart, Star, Ticket, Users, Wallet, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { canAccess } from '../../auth/accessPolicy';
import type { Role } from '../../auth/accessPolicy';
import { useAuthStore } from '../../stores/authStore';
import { useApi } from '../../hooks/useApi';

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; type?: string; }
const common: NavItem[] = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/booking', label: 'Lịch tập', icon: Calendar },
  { to: '/tickets', label: 'Hỗ trợ', icon: Ticket },
  { to: '/settings', label: 'Cài đặt', icon: Settings }
];
const member: NavItem[] = [
  { to: '/orders', label: 'Đơn hàng của tôi', icon: ShoppingCart },
  { to: '/loyalty', label: 'Loyalty', icon: Star },
  { to: '/referral', label: 'Giới thiệu', icon: Gift },
  { to: '/workouts', label: 'Bài tập của tôi', icon: Dumbbell, type: 'workouts' },
  { to: '/progress', label: 'Tiến trình', icon: Activity }
];
const coach: NavItem[] = [
  { to: '/members', label: 'Học viên', icon: Users },
  { to: '/crm', label: 'CRM', icon: ClipboardList, type: 'crm' }
];
const admin: NavItem[] = [
  { to: '/admin', label: 'Tổng quan quản trị', icon: Shield },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { to: '/admin/products', label: 'Sản phẩm', icon: Boxes },
  { to: '/admin/inventory', label: 'Tồn kho', icon: Package },
  { to: '/admin/analytics', label: 'Phân tích', icon: BarChart3 },
  { to: '/admin/revenue', label: 'Doanh thu', icon: Wallet },
  { to: '/admin/audit', label: 'Audit log', icon: FileText }
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(true);

  const { data: notificationsData } = useApi<any[]>('/notifications');
  const unreadCRM = (notificationsData || []).some(n => !n.is_read && n.type === 'workout_completed');
  const unreadWorkouts = (notificationsData || []).some(n => !n.is_read && n.type === 'workout_assigned');

  const role = user?.role as Role | undefined;
  const groups = role === 'admin'
    ? [{ label: 'Quản trị', items: admin }]
    : role === 'coach'
      ? [{ label: 'Không gian Coach', items: coach }, { label: 'Chung', items: common }]
      : [{ label: 'Cá nhân', items: member }, { label: 'Chung', items: common }];

  const signOut = async () => {
    await logout();
    window.location.replace('/login');
  };

  return (
    <aside className="command-sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">G</div>
        <div><strong>GYMFIT</strong><small>COMMAND CENTER</small></div>
        {onClose && (
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Đóng menu">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="sidebar-context">
        <span className="status-dot" /> {role === 'admin' ? 'ADMIN CONTROL' : role === 'coach' ? 'COACH WORKSPACE' : 'MEMBER SPACE'}
      </div>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {groups.map(group => (
          <div className="nav-group" key={group.label}>
            <span className="nav-label">{group.label}</span>
            {group.items.filter(item => role && canAccess(role, item.to)).map(item => {
              const hasBadge = (item.type === 'crm' && unreadCRM) || (item.type === 'workouts' && unreadWorkouts);
              return (
                <Link key={item.to} to={item.to} onClick={onClose} className={`nav-item ${location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) ? 'active' : ''} relative`}>
                  <item.icon size={17} />
                  <span>{item.label}</span>
                  {hasBadge && (
                    <span className="absolute right-3 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
        {role === 'admin' && (
          <div className="nav-group">
            <button className="nav-label nav-toggle" onClick={() => setAdminOpen(value => !value)}>
              Hệ thống <ChevronDown size={14} className={adminOpen ? '' : 'rotate-[-90deg]'} />
            </button>
            {adminOpen && (
              <Link to="/admin/backup" onClick={onClose} className={`nav-item ${location.pathname === '/admin/backup' ? 'active' : ''}`}>
                <Shield size={17} /><span>Backup</span>
              </Link>
            )}
          </div>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="profile-row">
          <div className="avatar">{user?.name?.slice(0, 1).toUpperCase() || 'G'}</div>
          <div><strong>{user?.name || 'GYMFIT user'}</strong><small>{role || 'member'}</small></div>
        </div>
        <button className="logout-button" onClick={() => void signOut()}><LogOut size={16} />Đăng xuất</button>
      </div>
    </aside>
  );
}
