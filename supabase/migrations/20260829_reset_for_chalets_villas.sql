-- Réinitialisation du catalogue ALPENIA et activation des types chalet/villa.
-- Les équipements et la configuration bancaire sont volontairement conservés.

alter type public.property_type add value if not exists 'chalet';
alter type public.property_type add value if not exists 'villa';

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
