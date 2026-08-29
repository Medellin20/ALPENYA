-- REMISE À ZÉRO RÉUTILISABLE
-- À exécuter dans Supabase SQL Editor lorsque vous souhaitez repartir avec
-- une base vide. La structure, les équipements et les coordonnées bancaires
-- sont conservés. Les photos et justificatifs stockés sont supprimés.

begin;

truncate table
  public.refund_requests,
  public.guarantee_payments,
  public.reservations,
  public.viewing_requests,
  public.status_history,
  public.favorites,
  public.property_amenities,
  public.property_images,
  public.properties,
  public.clients,
  public.contact_messages,
  public.admin_logs
restart identity cascade;

delete from storage.objects
where bucket_id in ('property-images', 'payment-proofs');

commit;

