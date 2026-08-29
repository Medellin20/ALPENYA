import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    { count: totalProperties },
    { count: availableProperties },
    { count: reservedProperties },
    { count: rentedProperties },
    { count: viewingRequestsTotal },
    { count: viewingsToday },
    { count: reservationsPending },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'rented'),
    supabase.from('viewing_requests').select('*', { count: 'exact', head: true }),
    supabase
      .from('viewing_requests')
      .select('*', { count: 'exact', head: true })
      .gte('requested_date', todayStart.toISOString().split('T')[0])
      .lte('requested_date', todayEnd.toISOString().split('T')[0]),
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
  ]);

  return {
    totalProperties: totalProperties ?? 0,
    availableProperties: availableProperties ?? 0,
    reservedProperties: reservedProperties ?? 0,
    rentedProperties: rentedProperties ?? 0,
    viewingRequestsTotal: viewingRequestsTotal ?? 0,
    viewingsToday: viewingsToday ?? 0,
    reservationsPending: reservationsPending ?? 0,
  };
}

export async function getRecentAdminLogs(limit = 8) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('admin_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAdminAlerts() {
  const supabase = createAdminClient();
  const [{ data: reservations }, { data: viewings }] = await Promise.all([
    supabase.from('reservations').select('id, reference, created_at').in('status', ['submitted', 'under_review']).order('created_at', { ascending: false }).limit(5),
    supabase.from('viewing_requests').select('id, reference, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ]);

  return [
    ...(reservations ?? []).map((item) => ({ ...item, label: `Réservation ${item.reference} à examiner`, href: '/admin/reservations', tone: 'warning' as const })),
    ...(viewings ?? []).map((item) => ({ ...item, label: `Visite ${item.reference} à organiser`, href: '/admin/visites', tone: 'info' as const })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
}
