-- Complète le catalogue sans modifier les annonces ni les coordonnées bancaires.
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
  ('air_conditioning', 'Climatisation', 'Wind'),
  ('terrace', 'Terrasse', 'Sun'),
  ('garage', 'Garage', 'Warehouse'),
  ('sauna', 'Sauna', 'Waves'),
  ('fireplace', 'Cheminée', 'Flame'),
  ('linen', 'Draps et linge fournis', 'BedDouble'),
  ('dryer', 'Sèche-linge', 'Wind')
on conflict (key) do nothing;

