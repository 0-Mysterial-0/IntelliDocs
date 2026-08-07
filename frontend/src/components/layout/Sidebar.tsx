import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, FileText, Upload, Search, Bot, CheckSquare,
  BarChart3, Users, Building2, Bell, Settings, ChevronLeft, ChevronRight,
  Train, LogOut, Shield
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'employee'] },
  { to: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'manager', 'employee'] },
  { to: '/contracts', icon: Shield, label: 'Contract Intelligence', roles: ['admin', 'manager', 'employee'], badge: '3 Expiring' },
  { to: '/upload', icon: Upload, label: 'Upload', roles: ['admin', 'manager', 'employee'] },
  { to: '/search', icon: Search, label: 'Search', roles: ['admin', 'manager', 'employee'] },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', roles: ['admin', 'manager', 'employee'] },
  { to: '/approvals', icon: CheckSquare, label: 'Approvals', roles: ['admin', 'manager', 'employee'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'manager'] },
  { to: '/departments', icon: Building2, label: 'Departments', roles: ['admin', 'manager', 'employee'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'manager', 'employee'] },
  { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'manager', 'employee'] },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const visibleItems = navItems.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#111827] border-r border-white/[0.06] sidebar-transition relative z-20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Train className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight">IntelliDocs</p>
            <p className="text-[10px] text-slate-400">KMRL</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
        {visibleItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300')} />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{label}</span>
                  {badge && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center py-2 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-[#1f2937] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
