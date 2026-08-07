import { Search, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-[#111827]/80 backdrop-blur border-b border-white/[0.06] flex items-center px-6 gap-4 flex-shrink-0 z-10">
      <button onClick={onMenuToggle} className="text-slate-400 hover:text-white transition-colors lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 max-w-md">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl text-sm text-slate-400 hover:text-slate-300 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Search documents...</span>
          <kbd className="ml-auto text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/[0.04]"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-500 rounded-full" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 hover:bg-white/[0.04] rounded-xl p-1.5 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
          </div>
          <span className="text-sm text-slate-300 font-medium hidden md:block">{user?.full_name?.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
}
