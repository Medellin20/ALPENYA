-- =============================================================================
-- ALPENIA — SCHÉMA DE BASE DE DONNÉES
-- À exécuter dans Supabase SQL Editor (Project > SQL Editor > New query)
-- Ordre d'exécution : schema.sql -> rls_policies.sql -> seed.sql
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

create type property_status as enum ('draft', 'available', 'reserved', 'rented', 'unavailable');
create type property_type as enum ('chalet', 'villa');

create type viewing_status as enum (
  'pending', 'payment_pending', 'paid', 'confirmed', 'cancelled', 'completed'
);

create type reservation_status as enum (
  'submitted', 'under_review', 'accepted', 'rejected', 'awaiting_guarantee',
  'guarantee_paid', 'confirmed', 'cancelled'
);

create type guarantee_status as enum (
  'awaiting_payment', 'payment_declared', 'payment_received',
  'reservation_confirmed', 'refund_requested', 'refund_processing',
  'refunded', 'cancelled'
);

create type refund_status as enum (
  'requested', 'approved', 'processing', 'refunded', 'rejected'
);

create type contact_status as enum ('new', 'in_progress', 'closed');

-- -----------------------------------------------------------------------------
-- CLIENTS
-- Prospects / locataires. Pas d'auth Supabase obligatoire : on identifie
-- un client par email. Si Supabase Auth est activé plus tard, on peut lier
-- auth_user_id.
-- -----------------------------------------------------------------------------

create table clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  profession text,
  monthly_income numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index clients_email_idx on clients (lower(email));

-- -----------------------------------------------------------------------------
-- PROPERTIES
-- -----------------------------------------------------------------------------

create table properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  property_type property_type not null default 'chalet',

  -- Localisation
  address text,                -- adresse complète, masquée au public tant que non visitée
  city text not null,
  postal_code text,
  neighborhood text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),

  -- Prix
  monthly_price numeric(10, 2) not null,
  service_charges numeric(10, 2) not null default 0,
  deposit_amount numeric(10, 2) not null default 0,
  viewing_fee numeric(10, 2) not null default 0,

  -- Caractéristiques
  surface_m2 numeric(6, 2) not null,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  rooms integer,
  floor integer,
  contract_type text not null default 'Période indéterminée',
  interior_type text not null default 'Non meublé',
  maintenance_condition text not null default 'Bien',
  has_elevator boolean not null default false,
  has_balcony boolean not null default false,
  has_terrace boolean not null default false,
  has_parking boolean not null default false,
  has_garage boolean not null default false,
  has_garden boolean not null default false,
  is_furnished boolean not null default false,

  -- Disponibilité
  available_from date,
  minimum_stay_months integer default 12,

  -- Statut / visibilité
  status property_status not null default 'draft',
  is_published boolean not null default false,
  is_featured boolean not null default false,

  view_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_city_idx on properties (city);
create index properties_status_idx on properties (status);
create index properties_published_idx on properties (is_published) where is_published = true;
create index properties_price_idx on properties (monthly_price);
create index properties_created_idx on properties (created_at desc);

-- -----------------------------------------------------------------------------
-- PROPERTY IMAGES
-- -----------------------------------------------------------------------------

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,        -- chemin dans le bucket property-images
  url text not null,                 -- URL publique complète (cache)
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index property_images_property_idx on property_images (property_id, sort_order);
create unique index property_images_one_primary_idx on property_images (property_id) where is_primary = true;

-- -----------------------------------------------------------------------------
-- AMENITIES (catalogue) + PROPERTY_AMENITIES (liaison)
-- -----------------------------------------------------------------------------

create table amenities (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,          -- ex: 'wifi', 'heating', 'dishwasher'
  label_fr text not null,
  icon text                          -- nom d'icône lucide-react
);

create table property_amenities (
  property_id uuid not null references properties(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- -----------------------------------------------------------------------------
-- VIEWING REQUESTS (demandes de visite)
-- -----------------------------------------------------------------------------

create table viewing_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,     -- ex: VIS-2026-000123
  property_id uuid not null references properties(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,

  requested_date date not null,
  requested_time_slot text not null,  -- ex: '14:00 - 14:30'
  occupants_count integer not null default 1,

  status viewing_status not null default 'pending',
  fee_amount numeric(10, 2) not null default 0,

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,

  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index viewing_requests_property_idx on viewing_requests (property_id);
create index viewing_requests_client_idx on viewing_requests (client_id);
create index viewing_requests_status_idx on viewing_requests (status);
create index viewing_requests_date_idx on viewing_requests (requested_date);

-- -----------------------------------------------------------------------------
-- RESERVATIONS (demande de location d'un logement)
-- -----------------------------------------------------------------------------

create table reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,     -- ex: REN-2026-000123
  property_id uuid not null references properties(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,

  desired_move_in_date date not null,
  duration_months integer not null default 12,
  occupants_count integer not null default 1,
  has_pets boolean not null default false,
  profession text,
  monthly_income numeric(10, 2),
  employment_contract text,
  origin_city text,

  status reservation_status not null default 'submitted',

  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_property_idx on reservations (property_id);
create index reservations_client_idx on reservations (client_id);
create index reservations_status_idx on reservations (status);

-- -----------------------------------------------------------------------------
-- GUARANTEE PAYMENTS (dépôt de garantie par virement)
-- -----------------------------------------------------------------------------

create table guarantee_payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,     -- ex: GUARANTEE-REN-000123
  reservation_id uuid not null references reservations(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,

  amount numeric(10, 2) not null,
  status guarantee_status not null default 'awaiting_payment',

  -- Déclaration du virement par le client
  declared_transfer_date date,
  declared_bank_name text,
  declared_reference text,
  proof_storage_path text,            -- justificatif dans Supabase Storage

  validated_at timestamptz,
  validated_by text,                  -- identifiant/nom de l'admin

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guarantee_payments_reservation_idx on guarantee_payments (reservation_id);
create index guarantee_payments_status_idx on guarantee_payments (status);

-- -----------------------------------------------------------------------------
-- REFUND REQUESTS (demandes de remboursement de garantie)
-- -----------------------------------------------------------------------------

create table refund_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,      -- ex: REFUND-REN-000123
  guarantee_payment_id uuid not null references guarantee_payments(id) on delete restrict,
  reservation_id uuid not null references reservations(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,

  amount numeric(10, 2) not null,
  reason text,
  status refund_status not null default 'requested',

  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  admin_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index refund_requests_reservation_idx on refund_requests (reservation_id);
create index refund_requests_status_idx on refund_requests (status);

-- -----------------------------------------------------------------------------
-- BANK SETTINGS (configuration bancaire — éditable depuis /admin uniquement)
-- Table à une seule ligne (singleton) protégée par RLS.
-- -----------------------------------------------------------------------------

create table bank_settings (
  id integer primary key default 1,
  beneficiary_name text not null default '',
  iban text not null default '',
  bic text not null default '',
  bank_name text not null default '',
  payment_instructions text not null default '',
  default_deposit_amount numeric(10, 2) not null default 0,
  updated_at timestamptz not null default now(),
  constraint bank_settings_singleton check (id = 1)
);

insert into bank_settings (id, beneficiary_name, iban, bic, bank_name, payment_instructions, default_deposit_amount)
values (1, 'ALPENIA (À CONFIGURER)', 'FR00 0000 0000 0000 0000 0000 000', 'XXXXXXXX', 'Banque à configurer',
        'RIB de démonstration — ne pas effectuer de virement avant son remplacement dans l''espace administrateur.', 0)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- CONTACT MESSAGES
-- -----------------------------------------------------------------------------

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status contact_status not null default 'new',
  created_at timestamptz not null default now()
);

create index contact_messages_status_idx on contact_messages (status);

-- -----------------------------------------------------------------------------
-- FAVORITES (favoris — identifiés par un id de session anonyme côté client)
-- -----------------------------------------------------------------------------

create table favorites (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, property_id)
);

-- -----------------------------------------------------------------------------
-- ADMIN LOGS (historique des actions administrateur)
-- -----------------------------------------------------------------------------

create table admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null default 'admin',
  action text not null,               -- ex: 'property.create', 'guarantee.validate'
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_logs_created_idx on admin_logs (created_at desc);
create index admin_logs_entity_idx on admin_logs (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- STATUS HISTORY (historique générique des changements de statut)
-- -----------------------------------------------------------------------------

create table status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,          -- 'viewing_request' | 'reservation' | 'guarantee_payment' | 'refund_request'
  entity_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by text not null default 'system',
  note text,
  created_at timestamptz not null default now()
);

create index status_history_entity_idx on status_history (entity_type, entity_id, created_at desc);

-- -----------------------------------------------------------------------------
-- TRIGGERS : updated_at automatique
-- -----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated_at before update on properties
  for each row execute function set_updated_at();
create trigger trg_clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger trg_viewing_requests_updated_at before update on viewing_requests
  for each row execute function set_updated_at();
create trigger trg_reservations_updated_at before update on reservations
  for each row execute function set_updated_at();
create trigger trg_guarantee_payments_updated_at before update on guarantee_payments
  for each row execute function set_updated_at();
create trigger trg_refund_requests_updated_at before update on refund_requests
  for each row execute function set_updated_at();
create trigger trg_bank_settings_updated_at before update on bank_settings
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- TRIGGER : un seul visuel principal par bien (met les autres à false)
-- -----------------------------------------------------------------------------

create or replace function enforce_single_primary_image()
returns trigger as $$
begin
  if new.is_primary then
    update property_images
      set is_primary = false
      where property_id = new.property_id and id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_single_primary_image
  before insert or update on property_images
  for each row execute function enforce_single_primary_image();

-- -----------------------------------------------------------------------------
-- STORAGE BUCKET : property-images (public en lecture)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Bucket privé pour les justificatifs de virement (jamais public)
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
