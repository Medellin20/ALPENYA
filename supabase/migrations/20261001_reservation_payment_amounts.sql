alter table public.reservations
  add column if not exists rental_amount numeric(10, 2),
  add column if not exists payment_amount numeric(10, 2);
