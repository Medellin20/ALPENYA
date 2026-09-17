-- Forfait ménage distinct des quatre tarifs saisonniers des villas.
alter table public.properties
  add column if not exists cleaning_fee numeric(10, 2) not null default 0
  check (cleaning_fee >= 0);

comment on column public.properties.cleaning_fee is 'Forfait ménage des villas en euros par séjour.';
