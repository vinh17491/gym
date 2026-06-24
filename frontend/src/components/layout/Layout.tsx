import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex"><Sidebar /></div>
      {mobileOpen && <div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} /><div className="absolute left-0 top-0 h-full"><Sidebar onClose={() => setMobileOpen(false)} /></div></div>}
      <main className="flex-1 overflow-y-auto p-6 bg-dark-900">
        <button className="md:hidden mb-4 p-2 rounded-lg bg-dark-800" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <Outlet />
      </main>
    </div>
  );
}
