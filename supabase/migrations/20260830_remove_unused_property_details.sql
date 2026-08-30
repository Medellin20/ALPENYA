-- Suppression définitive des informations de construction qui ne sont plus
-- collectées ni affichées par ALPENIA.
alter table public.properties
  drop column if exists construction_year,
  drop column if exists construction_type,
  drop column if exists energy_label,
  drop column if exists volume_m3,
  drop column if exists floors_count;
