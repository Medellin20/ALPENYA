alter table public.viewing_requests
  add column if not exists occupants_count integer not null default 1
  check (occupants_count between 1 and 10);

alter table public.reservations
  add column if not exists employment_contract text,
  add column if not exists origin_city text;
