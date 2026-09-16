-- Lien commun aux dernières étapes des demandes de visite et de réservation.
create table if not exists public.payment_settings (
  id integer primary key default 1 check (id = 1),
  payment_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint payment_settings_https check (payment_url = '' or payment_url ~ '^https://')
);
alter table public.payment_settings enable row level security;
revoke all on public.payment_settings from anon, authenticated;
grant all on public.payment_settings to service_role;
insert into public.payment_settings (id) values (1) on conflict (id) do nothing;
