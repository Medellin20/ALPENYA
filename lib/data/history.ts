import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export async function recordStatusChange(params: {
  entityType: 'viewing_request' | 'reservation' | 'guarantee_payment' | 'refund_request';
  entityId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy?: string;
  note?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from('status_history').insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    from_status: params.fromStatus,
    to_status: params.toStatus,
    changed_by: params.changedBy ?? 'system',
    note: params.note,
  });
}

export async function logAdminAction(params: {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  actor?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from('admin_logs').insert({
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    details: params.details ?? {},
    actor: params.actor ?? 'admin',
  });
}
