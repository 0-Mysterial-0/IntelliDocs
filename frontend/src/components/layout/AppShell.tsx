import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useState } from 'react';
import { CursorFollower } from '@/components/common/CursorFollower';

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#000000] text-white font-pixel overflow-hidden selection:bg-white selection:text-black relative">
      <CursorFollower />
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <TopBar onMenuToggle={() => setSidebarCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#000000]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
