-- À exécuter dans Supabase : SQL Editor > New query.
-- Ajoute les informations détaillées saisies avant l'upload des photos.

alter table public.properties
  add column if not exists floors_count integer,
  add column if not exists volume_m3 numeric(8, 2),
  add column if not exists contract_type text not null default 'Période indéterminée',
  add column if not exists interior_type text not null default 'Non meublé',
  add column if not exists maintenance_condition text not null default 'Bien',
  add column if not exists construction_type text not null default 'Bâtiment existant',
  add column if not exists construction_year integer,
  add column if not exists energy_label text,
  add column if not exists has_garage boolean not null default false;
