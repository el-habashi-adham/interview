import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Share2, Github } from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from '../components/ThemeToggle';

type Props = {
  children: React.ReactNode;
};

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          KnowledgeGraph
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-indigo-400"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-white border-r border-slate-200 px-3 py-4 md:block dark:bg-slate-900 dark:border-slate-800">
      <div className="px-3 py-2">
        <Link
          to="/"
          className="block text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          KG Demo
        </Link>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Internal docs</p>
      </div>
      <nav className="mt-4 space-y-1">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={16} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/search" icon={<Search size={16} />}>
          Smart Search
        </SidebarLink>
        <SidebarLink to="/graph" icon={<Share2 size={16} />}>
          Knowledge Graph
        </SidebarLink>
      </nav>
    </aside>
  );
}

function SidebarLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
          isActive
            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        )
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}
