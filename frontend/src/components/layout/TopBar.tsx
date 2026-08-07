import { Search, Bell, Menu, Command, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 md:h-16 bg-[#09090b] border-b-2 border-[#27272a] flex items-center px-3 md:px-6 gap-2 md:gap-4 flex-shrink-0 z-10 font-pixel">
      {/* Mobile hamburger - only on small screens */}
      <button
        onClick={onMenuToggle}
        className="text-zinc-400 hover:text-white transition-colors md:hidden p-1 flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search button */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2 px-3 py-1.5 md:py-2 bg-black border-2 border-zinc-700 hover:border-white text-xs text-zinc-400 hover:text-white transition-all shadow-[2px_2px_0px_0px_#27272a] max-w-sm"
        >
          <Search className="w-4 h-4 text-zinc-400 stroke-[2.5] flex-shrink-0" />
          <span className="font-pixel text-[10px] md:text-[11px] uppercase tracking-wider truncate">SEARCH DOCUMENTS...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-0.5 text-[10px] bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 font-pixel-code text-white flex-shrink-0">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto flex-shrink-0">
        {/* System status - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black border-2 border-green-500/50 text-green-400 font-pixel-code text-xs font-bold shadow-[2px_2px_0px_0px_rgba(74,222,128,0.3)]">
          <span className="w-2 h-2 rounded-none bg-green-400 animate-pulse" />
          <span className="font-bloom-green">SYSTEM HEALTHY</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-zinc-400 hover:text-white p-1.5 md:p-2 border-2 border-zinc-800 bg-black hover:border-white transition-all shadow-[2px_2px_0px_0px_#18181b]"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[2.5]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white" />
        </button>

        {/* User avatar/profile */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 bg-black hover:bg-zinc-900 border-2 border-white px-2 md:px-3 py-1 shadow-[3px_3px_0px_0px_#ffffff] transition-all"
          aria-label="Profile settings"
        >
          <div className="w-5 h-5 md:w-6 md:h-6 border border-black bg-white text-black flex items-center justify-center text-[10px] md:text-xs font-bold font-pixel-head flex-shrink-0">
            {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
          </div>
          <span className="text-xs text-white font-pixel-head font-bold font-bloom hidden sm:block max-w-[80px] truncate">
            {user?.full_name?.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
