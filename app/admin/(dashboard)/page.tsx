import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Clock,
  Home,
  CalendarClock,
  FileText,
  PlusCircle,
  BellRing,
} from 'lucide-react';
import { getAdminAlerts, getDashboardStats, getRecentAdminLogs } from '@/lib/data/admin-stats';
import { StatCard } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils/format';
import { DashboardAutoRefresh } from '@/components/admin/dashboard-auto-refresh';

export const metadata: Metadata = { title: 'Dashboard admin' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, logs, alerts] = await Promise.all([getDashboardStats(), getRecentAdminLogs(), getAdminAlerts()]);

  return (
    <div>
      <DashboardAutoRefresh />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-ink-500">Vue d’ensemble de l’activité de l’agence.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/appartements/nouveau">
            <PlusCircle className="h-4 w-4" />
            Ajouter un bien
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard href="/admin/appartements" icon={Building2} label="Total des biens" value={stats.totalProperties} />
        <StatCard href="/admin/appartements?status=available" icon={Home} label="Disponibles" value={stats.availableProperties} tone="positive" />
        <StatCard href="/admin/appartements?status=reserved" icon={Clock} label="Réservés" value={stats.reservedProperties} tone="warning" />
        <StatCard href="/admin/appartements?status=rented" icon={CheckCircle2} label="Loués" value={stats.rentedProperties} />
        <StatCard href="/admin/visites" icon={CalendarClock} label="Demandes de visite" value={stats.viewingRequestsTotal} tone="info" />
        <StatCard href="/admin/visites?date=today" icon={CalendarClock} label="Visites aujourd’hui" value={stats.viewingsToday} tone="positive" />
        <StatCard href="/admin/reservations?scope=pending" icon={FileText} label="Réservations en attente" value={stats.reservationsPending} tone="warning" />
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-bold text-ink-900">
          <BellRing className="h-5 w-5 text-amber-600" />
          Alertes à traiter
          {alerts.length > 0 && <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs text-white">{alerts.length}</span>}
        </h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Aucune alerte en attente.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <li key={`${alert.href}-${alert.id}`}>
                <Link href={alert.href} className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition hover:shadow-card sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="min-w-0 font-medium text-ink-700">{alert.label}</span>
                  <time className="shrink-0 text-xs text-ink-400">{formatDateTime(alert.created_at)}</time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-ink-900">Activité récente</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">Aucune action enregistrée pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="min-w-0 text-ink-700">{log.action}</span>
                <span className="shrink-0 text-xs text-ink-400">{formatDateTime(log.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
