import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      <div className="hidden md:flex flex-shrink-0"><Sidebar /></div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full shadow-2xl shadow-black/40" onClick={() => setMobileOpen(false)}><Sidebar onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto" role="main">
        <div className="sticky top-0 z-30 glass md:hidden">
          <div className="flex items-center gap-3 px-4 h-14">
            <button className="p-2 rounded-lg hover:bg-[#1e293b] transition-colors" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold">GYM<span className="text-[#22C55E]">ER</span></h1>
          </div>
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15, ease: 'easeIn' } }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
