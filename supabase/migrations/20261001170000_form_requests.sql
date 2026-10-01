-- Demandes reçues via les formulaires publics. Les tables historiques
-- viewing_requests et reservations restent utilisées par leurs parcours existants.
create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  property_id uuid not null references public.properties(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  requested_date date not null,
  requested_time_slot text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  property_id uuid not null references public.properties(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  desired_move_in_date date not null,
  selected_rate_id text,
  duration_days integer not null check (duration_days between 1 and 365),
  occupants_count integer not null check (occupants_count between 1 and 50),
  has_pets boolean not null default false,
  has_cleaning_fee boolean not null default false,
  cleaning_fee_amount numeric(10, 2) not null default 0,
  rental_amount numeric(10, 2),
  payment_amount numeric(10, 2),
  status text not null default 'new' check (status in ('new', 'in_progress', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visit_requests_created_at_idx on public.visit_requests (created_at desc);
create index if not exists visit_requests_status_idx on public.visit_requests (status);
create index if not exists reservation_requests_created_at_idx on public.reservation_requests (created_at desc);
create index if not exists reservation_requests_status_idx on public.reservation_requests (status);

alter table public.visit_requests enable row level security;
alter table public.reservation_requests enable row level security;

-- L'écriture et la consultation passent par les Server Actions protégées et le service role.
revoke all on public.visit_requests from anon, authenticated;
revoke all on public.reservation_requests from anon, authenticated;
