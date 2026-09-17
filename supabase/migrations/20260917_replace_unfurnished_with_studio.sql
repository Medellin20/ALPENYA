  -- Renomme la catégorie en conservant les annonces et leurs relations.
  do $$
  begin
    if exists (
      select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = 'property_type'
        and e.enumlabel = 'unfurnished_apartment'
    ) and not exists (
      select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = 'property_type'
        and e.enumlabel = 'furnished_studio'
    ) then
      alter type public.property_type rename value 'unfurnished_apartment' to 'furnished_studio';
    end if;
  end $$;

  update public.properties
  set property_type = 'furnished_studio',
      is_furnished = true,
      interior_type = 'Meublé',
      contract_type = 'Location au mois'
  where property_type::text in ('unfurnished_apartment', 'furnished_studio');
