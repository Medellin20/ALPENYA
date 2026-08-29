'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarClock,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Landmark,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { logoutAdmin } from '@/actions/admin-auth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/appartements', label: 'Chalets & villas', icon: Building2 },
  { href: '/admin/appartements/nouveau', label: 'Ajouter un bien', icon: PlusCircle },
  { href: '/admin/visites', label: 'Visites', icon: CalendarClock },
  { href: '/admin/reservations', label: 'Réservations', icon: FileText },
  { href: '/admin/garanties', label: 'Garanties', icon: ShieldCheck },
  { href: '/admin/remboursements', label: 'Remboursements', icon: RefreshCcw },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/configuration-bancaire', label: 'Coordonnées bancaires', icon: Landmark },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-white/10 text-white' : 'text-sand-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-950 lg:sticky lg:top-0 lg:flex">
        <SidebarHeader />
        <NavLinks pathname={pathname} />
        <LogoutSection />
      </aside>

      {/* Topbar mobile */}
      <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-700 text-white">
            <Home className="h-4 w-4" />
          </span>
          <span className="truncate font-extrabold text-ink-900">ALPENYA</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-ink-700"
          aria-label="Ouvrir le menu admin"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} />
          <div className="relative flex h-full w-[min(18rem,calc(100vw-2rem))] flex-col bg-ink-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4">
              <SidebarHeader compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-sand-300 hover:bg-white/10"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <LogoutSection />
          </div>
        </div>
      )}
    </>
  );
}

function SidebarHeader({ compact }: { compact?: boolean }) {
  return (
    <Link href="/admin" className={cn('flex items-center gap-2', !compact && 'px-5 py-5')}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
        <Home className="h-4.5 w-4.5 text-white" />
      </span>
      <div>
        <p className="text-sm font-extrabold text-white">ALPENYA</p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-sand-400">Administration</p>
      </div>
    </Link>
  );
}

function LogoutSection() {
  return (
    <div className="border-t border-white/10 p-3">
      <form action={logoutAdmin}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-sand-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4.5 w-4.5" />
          Déconnexion
        </button>
      </form>
    </div>
  );
}
