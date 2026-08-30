alter table public.reservations
  add column if not exists has_pets boolean not null default false,
  drop column if exists message;

alter table public.properties
  drop column if exists pets_allowed;
