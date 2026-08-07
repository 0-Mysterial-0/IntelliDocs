import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CursorFollower } from '@/components/common/CursorFollower';
import { LayoutDashboard, FileText, Upload, Search, Bot, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'HOME' },
  { to: '/documents', icon: FileText, label: 'DOCS' },
  { to: '/upload', icon: Upload, label: 'UPLOAD' },
  { to: '/search', icon: Search, label: 'SEARCH' },
  { to: '/ai-assistant', icon: Bot, label: 'AI' },
  { to: '/approvals', icon: CheckSquare, label: 'APPROVALS' },
];

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Responsive breakpoint tracking
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile || tablet);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen bg-[#000000] text-white font-pixel overflow-hidden selection:bg-white selection:text-black relative">
      {/* Only show cursor follower on non-touch devices */}
      {!isMobile && <CursorFollower />}

      {/* Desktop/Tablet Sidebar */}
      <div className={`hidden md:block h-full flex-shrink-0 transition-all duration-200`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
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

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden bg-[#000000] scroll-smooth"
          style={{ paddingBottom: isMobile ? '80px' : undefined }}
        >
          <div className="p-3 sm:p-5 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b] border-t-2 border-[#27272a] flex items-stretch h-16 mobile-safe-bottom md:hidden">
            {mobileNavItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
              return (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-pixel-head font-bold uppercase transition-colors',
                    isActive ? 'text-white bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <Icon className={cn('w-5 h-5 stroke-[2]', isActive && 'text-white')} />
                  <span className="leading-none">{label}</span>
                  {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-white" />}
                </button>
              );
            })}
            {/* Hamburger for more items */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-pixel-head font-bold uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="w-5 h-0.5 bg-current" />
                <span className="w-5 h-0.5 bg-current" />
                <span className="w-5 h-0.5 bg-current" />
              </div>
              <span className="leading-none mt-0.5">MORE</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
