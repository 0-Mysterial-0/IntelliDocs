import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CursorFollower } from '@/components/common/CursorFollower';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle window resize for automatic responsive state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-white font-pixel overflow-hidden selection:bg-white selection:text-black relative">
      <CursorFollower />

      {/* Desktop Sidebar & Mobile Drawer */}
      <div className={`hidden lg:block h-full transition-all duration-200`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#09090b] shadow-2xl border-r-2 border-[#27272a]">
            <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative z-10">
        <TopBar onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#000000] scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
