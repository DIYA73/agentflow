'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Zap, Clock, Settings, LogOut, ChevronRight, Menu, X, Timer } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/flows',     icon: Zap,             label: 'Flows' },
  { href: '/triggers',  icon: Timer,            label: 'Triggers' },
  { href: '/executions',icon: Clock,            label: 'Executions' },
  { href: '/settings',  icon: Settings,         label: 'Settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('accessToken');
    if (!token) router.push('/login');
  }, [router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} h-full bg-surface border-r border-border flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm flex-shrink-0">⚡</div>
              <span className="font-semibold text-text">agentflow</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-text-dim hover:text-text transition-colors ml-auto">
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active ? 'bg-accent/15 text-accent' : 'text-text-dim hover:text-text hover:bg-border'
                }`}
              >
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {!collapsed && active && <ChevronRight size={13} className="ml-auto text-accent" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          {!collapsed && (
            <div className="mb-2 px-2">
              <p className="text-xs font-semibold text-text truncate">{user.name}</p>
              <p className="text-xs text-text-dim truncate">{user.workspaceName}</p>
            </div>
          )}
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-dim hover:text-red-400 hover:bg-red-900/10 transition-all w-full"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
