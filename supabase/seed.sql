-- =============================================================================
-- ALPENIA — DONNÉES DE RÉFÉRENCE (aucun bien ni client)
-- À exécuter après schema.sql et rls_policies.sql
-- Utilise la service role (SQL Editor Supabase l'exécute déjà avec les
-- droits nécessaires, RLS n'entre pas en jeu ici).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- AMENITIES
-- -----------------------------------------------------------------------------

insert into amenities (key, label_fr, icon) values
  ('wifi', 'Wi-Fi', 'Wifi'),
  ('heating', 'Chauffage', 'Flame'),
  ('equipped_kitchen', 'Cuisine équipée', 'CookingPot'),
  ('washing_machine', 'Machine à laver', 'WashingMachine'),
  ('dishwasher', 'Lave-vaisselle', 'Utensils'),
  ('parking', 'Parking', 'SquareParking'),
  ('balcony', 'Balcon', 'DoorOpen'),
  ('elevator', 'Ascenseur', 'ArrowUpDown'),
  ('garden', 'Jardin', 'Trees'),
  ('cellar', 'Cave', 'Warehouse'),
  ('bike_storage', 'Local à vélos', 'Bike'),
  ('air_conditioning', 'Climatisation', 'Wind')
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Configuration bancaire de démonstration (à modifier depuis /admin)
-- -----------------------------------------------------------------------------

update bank_settings set
  beneficiary_name = 'ALPENIA (À CONFIGURER)',
  iban = 'FR00 0000 0000 0000 0000 0000 000',
  bic = 'XXXXXXXX',
  bank_name = 'Banque à configurer',
  payment_instructions = 'RIB de démonstration — ne pas effectuer de virement avant son remplacement dans l’espace administrateur.',
  default_deposit_amount = 0
where id = 1;
