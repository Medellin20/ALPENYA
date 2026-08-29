-- À exécuter dans Supabase : SQL Editor > New query.
-- Prépare la table et le bucket utilisés par l'upload des photos de logements.
-- Les anciennes images de démonstration sont supprimées. Les photos uploadées
-- depuis l'administration sont conservées car leur chemin ne commence pas par seed/.

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  url text not null,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

delete from public.property_images
where storage_path like 'seed/%'
   or url like 'https://images.unsplash.com/%';

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

create unique index if not exists property_images_one_primary_idx
  on public.property_images (property_id)
  where is_primary = true;

create or replace function public.enforce_single_primary_image()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_primary then
    update public.property_images
    set is_primary = false
    where property_id = new.property_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_primary_image on public.property_images;
create trigger trg_single_primary_image
  before insert or update of is_primary on public.property_images
  for each row execute function public.enforce_single_primary_image();

alter table public.property_images enable row level security;

drop policy if exists "public_read_property_images" on public.property_images;
create policy "public_read_property_images"
  on public.property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_images.property_id
        and p.is_published = true
        and p.status <> 'draft'
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_property_images_bucket" on storage.objects;
create policy "public_read_property_images_bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

-- Les insertions/suppressions ne sont pas ouvertes au navigateur :
-- la Server Action utilise SUPABASE_SERVICE_ROLE_KEY et ajoute automatiquement
-- une ligne dans public.property_images après chaque fichier envoyé au bucket.
