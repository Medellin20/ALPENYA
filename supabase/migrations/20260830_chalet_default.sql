-- Séparé de l'ajout à l'enum : PostgreSQL exige que la nouvelle valeur soit
-- validée avant de pouvoir être utilisée comme valeur par défaut.
alter table public.properties alter column property_type set default 'chalet';

