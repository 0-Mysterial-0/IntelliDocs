import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useContractsStore } from '@/store/contractsStore';
import {
  LayoutDashboard, FileText, Upload, Search, Bot, CheckSquare,
  BarChart3, Users, Building2, Bell, Settings, ChevronLeft, ChevronRight,
  Train, LogOut, Shield, Sparkles, Ban
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'DASHBOARD', roles: ['admin', 'manager', 'employee'] },
  { to: '/documents', icon: FileText, label: 'DOCUMENTS', roles: ['admin', 'manager', 'employee'] },
  { to: '/upload', icon: Upload, label: 'UPLOAD DOCUMENTS', roles: ['admin', 'manager', 'employee'] },
  { to: '/contracts', icon: Shield, label: 'CONTRACTS', roles: ['admin', 'manager', 'employee'], badge: null as null },
  { to: '/revoke-contracts', icon: Ban, label: 'REVOKE CONTRACT', roles: ['admin', 'manager', 'employee'] },
  { to: '/approvals', icon: CheckSquare, label: 'APPROVALS', roles: ['admin', 'manager', 'employee'] },
  { to: '/search', icon: Search, label: 'SEARCH', roles: ['admin', 'manager', 'employee'] },
  { to: '/ai-assistant', icon: Bot, label: 'AI ASSISTANT', roles: ['admin', 'manager', 'employee'], isAi: true },
  { to: '/analytics', icon: BarChart3, label: 'ANALYTICS', roles: ['admin', 'manager', 'employee'] },
  { to: '/departments', icon: Building2, label: 'DEPARTMENTS', roles: ['admin', 'manager', 'employee'] },
  { to: '/notifications', icon: Bell, label: 'NOTIFICATIONS', roles: ['admin', 'manager', 'employee'] },
  { to: '/users', icon: Users, label: 'USERS', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'SETTINGS', roles: ['admin', 'manager', 'employee'] },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const contractsStore = useContractsStore();
  const expiringCount = contractsStore.expiringCount();

  const visibleItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#09090b] border-r-2 border-[#27272a] sidebar-transition relative z-20 font-pixel-head',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header -> Redirects to Home Page */}
      <NavLink
        to="/"
        className="flex items-center gap-3.5 px-4 py-5 border-b-2 border-[#27272a] cursor-pointer group hover:bg-zinc-900 transition-colors"
      >
        <Train className="w-7 h-7 text-white stroke-[2.5] flex-shrink-0 animate-pixel-float group-hover:scale-110 transition-transform" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white font-bloom tracking-wider group-hover:text-[#6ee7b7] transition-colors">INTELLIDOCS</p>
            <p className="text-[10px] font-pixel-code text-[#a1a1aa] uppercase tracking-widest mt-0.5">KMRL METRO INTELLIDOCS</p>
          </div>
        )}
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1.5 font-pixel">
        {visibleItems.map(({ to, icon: Icon, label, badge, isAi }) => {
          const isActive = location.pathname === to || (to !== '/' && to !== '/contracts' && location.pathname.startsWith(to + '/'));
          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-none text-xs font-bold transition-all duration-150 group relative border-2',
                isActive
                  ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_#ffffff]'
                  : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900 hover:border-zinc-700'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0 stroke-[2.5]', isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white', isAi && !isActive && 'text-green-400')} />
              {!collapsed && (
                <>
                  <span className={cn('truncate flex-1 tracking-wider', isActive && 'font-bloom')}>{label}</span>
                  {isAi && <Sparkles className="w-3.5 h-3.5 text-green-400 animate-pulse" />}
                  {to === '/contracts' && expiringCount > 0 && (
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 font-pixel-code font-bold">
                      {expiringCount} EXP
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer - Clean Log Out Button Only */}
      <div className="p-3 border-t-2 border-[#27272a]">
        {!collapsed ? (
          <button
            onClick={logout}
            className="pixel-btn-dark w-full flex items-center justify-center gap-2 hover:bg-zinc-900 border-zinc-700"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>LOG OUT</span>
          </button>
        ) : (
          <button
            onClick={logout}
            title="LOG OUT"
            className="w-full flex justify-center py-2.5 bg-black border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-[72px] w-7 h-7 bg-[#09090b] border-2 border-white text-white flex items-center justify-center shadow-[2px_2px_0px_0px_#ffffff] hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
