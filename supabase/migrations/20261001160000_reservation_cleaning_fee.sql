alter table public.reservations
  add column if not exists has_cleaning_fee boolean not null default false,
  add column if not exists cleaning_fee_amount numeric(10, 2) not null default 0;
