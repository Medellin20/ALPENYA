-- À exécuter dans Supabase : SQL Editor > New query.
-- Supprime uniquement les 12 logements standards fournis avec le projet.
-- Les logements créés depuis l'administration ne sont pas concernés.

begin;

create temporary table demo_property_ids on commit drop as
select id
from public.properties
where slug in (
  'amsterdam-modern-apartment-centrum',
  'amsterdam-family-flat-de-pijp',
  'rotterdam-loft-kop-van-zuid',
  'rotterdam-studio-centrum',
  'utrecht-canal-house-binnenstad',
  'utrecht-studio-wittevrouwen',
  'eindhoven-duplex-strijp-s',
  'the-hague-apartment-statenkwartier',
  'the-hague-studio-centrum',
  'groningen-apartment-binnenstad',
  'groningen-loft-noorderplantsoen',
  'amsterdam-oost-apartment-brouwer'
)
or address in (
  'Herengracht 45',
  'Ferdinand Bolstraat 112',
  'Wilhelminakade 88',
  'Coolsingel 22',
  'Oudegracht 210',
  'Nachtegaalstraat 18',
  'Torenallee 40',
  'Nassaulaan 5',
  'Herderstraat 12',
  'Oude Kijk in ''t Jatstraat 34',
  'Violenstraat 9',
  'Linnaeusstraat 78'
);

delete from public.refund_requests
where reservation_id in (
  select id from public.reservations
  where property_id in (select id from demo_property_ids)
);

delete from public.status_history
where (entity_type = 'reservation' and entity_id in (
  select id from public.reservations
  where property_id in (select id from demo_property_ids)
)) or (entity_type = 'viewing' and entity_id in (
  select id from public.viewing_requests
  where property_id in (select id from demo_property_ids)
));

delete from public.guarantee_payments
where reservation_id in (
  select id from public.reservations
  where property_id in (select id from demo_property_ids)
);

delete from public.reservations
where property_id in (select id from demo_property_ids);

delete from public.viewing_requests
where property_id in (select id from demo_property_ids);

delete from public.status_history
where entity_type = 'property'
  and entity_id in (select id from demo_property_ids);

delete from public.properties
where id in (select id from demo_property_ids);

commit;
