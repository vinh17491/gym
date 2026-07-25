import { Menu, Search, Bell, CheckCircle2 } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useApi } from '../../hooks/useApi';
import api from '../../api/axios';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const { data: notificationsData, refetch } = useApi<any[]>('/notifications');
  const notifications = notificationsData || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      refetch();
    } catch (e) { }
  };

  const title = location.pathname.startsWith('/admin') ? 'Quản trị' : location.pathname === '/coach' ? 'Không gian Coach' : 'Không gian cá nhân';

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="mobile-drawer">
          <button className="drawer-backdrop" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} />
          <div className="drawer-content">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-context">
            <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
              <Menu size={19} />
            </button>
            <div>
              <span>GYMFIT / {title}</span>
              <strong>{location.pathname === '/' ? 'Dashboard' : title}</strong>
            </div>
          </div>
          <div className="topbar-tools">
            <div className="relative">
              <button
                className="icon-button relative"
                aria-label="Thông báo"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h4 className="font-semibold text-white text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {notifications.length > 0 ? notifications.map((n: any) => (
                      <div key={n.id} className={`p-3 rounded-lg transition-colors ${!n.is_read ? 'bg-blue-900/20' : 'hover:bg-slate-800'}`}>
                        <p className="text-sm font-medium text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    )) : (
                      <p className="text-center text-xs text-slate-500 py-4">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-button" aria-label="Tìm kiếm"><Search size={18} /></button>
            <span className="topbar-date">{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </header>

        <main className="app-content">
          <div className="content-frame" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
