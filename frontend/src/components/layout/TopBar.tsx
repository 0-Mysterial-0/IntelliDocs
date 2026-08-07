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
    <header className="h-16 bg-[#09090b] border-b-2 border-[#27272a] flex items-center px-6 gap-4 flex-shrink-0 z-10 font-pixel">
      <button onClick={onMenuToggle} className="text-zinc-400 hover:text-white transition-colors lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search Input Box */}
      <div className="flex-1 max-w-md">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2 px-3.5 py-2 bg-black border-2 border-zinc-700 hover:border-white text-xs text-zinc-400 hover:text-white transition-all shadow-[2px_2px_0px_0px_#27272a]"
        >
          <Search className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
          <span className="font-pixel text-[11px] uppercase tracking-wider">SEARCH DOCUMENTS, CONTRACTS...</span>
          <kbd className="ml-auto flex items-center gap-0.5 text-[10px] bg-zinc-800 border border-zinc-600 px-1.5 py-0.5 font-pixel-code text-white">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black border-2 border-green-500/50 text-green-400 font-pixel-code text-xs font-bold shadow-[2px_2px_0px_0px_rgba(74,222,128,0.3)]">
          <span className="w-2 h-2 rounded-none bg-green-400 animate-pulse" />
          <span className="font-bloom-green">SYSTEM HEALTHY</span>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative text-zinc-400 hover:text-white p-2 border-2 border-zinc-800 bg-black hover:border-white transition-all shadow-[2px_2px_0px_0px_#18181b]"
        >
          <Bell className="w-4 h-4 stroke-[2.5]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-white" />
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 bg-black hover:bg-zinc-900 border-2 border-white px-3 py-1 shadow-[3px_3px_0px_0px_#ffffff] transition-all"
        >
          <div className="w-6 h-6 border border-black bg-white text-black flex items-center justify-center text-xs font-bold font-pixel-head">
            {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
          </div>
          <span className="text-xs text-white font-pixel-head font-bold font-bloom hidden md:block">{user?.full_name?.split(' ')[0]}</span>
        </button>
      </div>
    </header>
  );
}
