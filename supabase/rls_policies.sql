-- =============================================================================
-- REAL ESTATE NL — ROW LEVEL SECURITY (RLS)
-- À exécuter après schema.sql
--
-- Principe général :
--   - Le client anonyme (clé anon) ne peut LIRE que les données publiques
--     (biens publiés) et INSÉRER uniquement les lignes qui représentent
--     SA PROPRE démarche (nouvelle demande de visite, nouvelle réservation,
--     message de contact, favoris...).
--   - Aucune opération de lecture de données privées d'autrui, aucune
--     modification, aucune suppression n'est autorisée avec la clé anon.
--   - Toutes les opérations d'administration (lecture des clients, mise à
--     jour des statuts, IBAN, validation des paiements...) passent
--     exclusivement par le serveur (Server Actions / Route Handlers) avec
--     la SUPABASE_SERVICE_ROLE_KEY, qui contourne RLS. Cette clé n'est
--     JAMAIS envoyée au navigateur.
-- =============================================================================

                                                                                                                                                                                                                          alter table properties            enable row level security;
                                                                                                                                                                                                                          alter table property_images       enable row level security;
                                                                                                                                                                                                                          alter table amenities              enable row level security;
                                                                                                                                                                                                                          alter table property_amenities    enable row level security;
                                                                                                                                                                                                                          alter table clients                enable row level security;
                                                                                                                                                                                                                          alter table viewing_requests      enable row level security;
                                                                                                                                                                                                                          alter table reservations           enable row level security;
                                                                                                                                                                                                                          alter table guarantee_payments    enable row level security;
                                                                                                                                                                                                                          alter table refund_requests       enable row level security;
                                                                                                                                                                                                                          alter table bank_settings          enable row level security;
                                                                                                                                                                                                                          alter table contact_messages      enable row level security;
                                                                                                                                                                                                                          alter table favorites               enable row level security;
                                                                                                                                                                                                                          alter table admin_logs             enable row level security;
                                                                                                                                                                                                                          alter table status_history         enable row level security;

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- PROPERTIES — lecture publique des biens publiés uniquement
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          create policy "public_read_published_properties"
                                                                                                                                                                                                                            on properties for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (is_published = true and status <> 'draft');

                                                                                                                                                                                                                          -- Aucune policy insert/update/delete pour anon/authenticated : uniquement
                                                                                                                                                                                                                          -- via service role côté serveur (l'espace admin).

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- PROPERTY IMAGES — lecture publique liée à un bien publié
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          create policy "public_read_property_images"
                                                                                                                                                                                                                            on property_images for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (
                                                                                                                                                                                                                              exists (
                                                                                                                                                                                                                                select 1 from properties p
                                                                                                                                                                                                                                where p.id = property_images.property_id
                                                                                                                                                                                                                                  and p.is_published = true
                                                                                                                                                                                                                                  and p.status <> 'draft'
                                                                                                                                                                                                                              )
                                                                                                                                                                                                                            );

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- AMENITIES — catalogue public en lecture
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          create policy "public_read_amenities"
                                                                                                                                                                                                                            on amenities for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (true);

                                                                                                                                                                                                                          create policy "public_read_property_amenities"
                                                                                                                                                                                                                            on property_amenities for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (
                                                                                                                                                                                                                              exists (
                                                                                                                                                                                                                                select 1 from properties p
                                                                                                                                                                                                                                where p.id = property_amenities.property_id
                                                                                                                                                                                                                                  and p.is_published = true
                                                                                                                                                                                                                                  and p.status <> 'draft'
                                                                                                                                                                                                                              )
                                                                                                                                                                                                                            );

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- CLIENTS — aucune lecture publique (données personnelles)
                                                                                                                                                                                                                          -- Insertion autorisée uniquement via Server Actions (service role), donc
                                                                                                                                                                                                                          -- pas de policy insert pour anon ici : la création de client se fait
                                                                                                                                                                                                                          -- côté serveur pour permettre la déduplication par email.
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          -- (aucune policy anon => accès refusé par défaut, RLS activé)

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- VIEWING REQUESTS / RESERVATIONS / GUARANTEES / REFUNDS
                                                                                                                                                                                                                          -- Ces opérations sensibles (création + lecture du dossier client) sont
                                                                                                                                                                                                                          -- exécutées via Server Actions avec la clé service role, qui contourne RLS.
                                                                                                                                                                                                                          -- Aucune policy anon n'est nécessaire : cela garantit qu'aucun visiteur ne
                                                                                                                                                                                                                          -- peut lire les dossiers d'un autre client depuis le navigateur.
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          -- (aucune policy anon => accès refusé par défaut, RLS activé)

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- BANK SETTINGS — jamais exposé en lecture publique directe.
                                                                                                                                                                                                                          -- Le montant/IBAN affiché au client passe par une Server Action dédiée
                                                                                                                                                                                                                          -- qui ne renvoie que les champs strictement nécessaires à l'affichage.
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          -- (aucune policy anon => accès refusé par défaut, RLS activé)

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- CONTACT MESSAGES — le formulaire écrit via Server Action (service role).
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          -- (aucune policy anon => accès refusé par défaut, RLS activé)

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- FAVORITES — un visiteur peut gérer SES PROPRES favoris, identifiés par
                                                                                                                                                                                                                          -- un session_id anonyme stocké côté client (cookie/localStorage), jamais
                                                                                                                                                                                                                          -- les favoris d'un autre visiteur.
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          create policy "anon_manage_own_favorites_select"
                                                                                                                                                                                                                            on favorites for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (session_id = current_setting('request.headers', true)::json->>'x-session-id');

                                                                                                                                                                                                                          create policy "anon_manage_own_favorites_insert"
                                                                                                                                                                                                                            on favorites for insert
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            with check (session_id = current_setting('request.headers', true)::json->>'x-session-id');

                                                                                                                                                                                                                          create policy "anon_manage_own_favorites_delete"
                                                                                                                                                                                                                            on favorites for delete
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (session_id = current_setting('request.headers', true)::json->>'x-session-id');

                                                                                                                                                                                                                          -- Remarque : dans cette application, les favoris sont en pratique gérés
                                                                                                                                                                                                                          -- via une Server Action (service role) pour éviter toute dépendance à un
                                                                                                                                                                                                                          -- header custom peu fiable ; les policies ci-dessus servent de filet de
                                                                                                                                                                                                                          -- sécurité si un accès direct depuis le client était activé plus tard.

                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------
                                                                                                                                                                                                                          -- ADMIN LOGS / STATUS HISTORY — jamais accessibles au public.
                                                                                                                                                                                                                          -- -----------------------------------------------------------------------------

                                                                                                                                                                                                                          -- (aucune policy anon => accès refusé par défaut, RLS activé)

                                                                                                                                                                                                                          -- =============================================================================
                                                                                                                                                                                                                          -- STORAGE POLICIES
                                                                                                                                                                                                                          -- =============================================================================

                                                                                                                                                                                                                          -- property-images : lecture publique, écriture interdite au client
                                                                                                                                                                                                                          -- (l'upload passe par une Server Action utilisant la service role).
                                                                                                                                                                                                                          create policy "public_read_property_images_bucket"
                                                                                                                                                                                                                            on storage.objects for select
                                                                                                                                                                                                                            to anon, authenticated
                                                                                                                                                                                                                            using (bucket_id = 'property-images');

-- payment-proofs : bucket privé, aucun accès direct anon (ni lecture ni
-- écriture). L'upload du justificatif de virement passe par une Server
-- Action serveur qui utilise la service role, et l'admin y accède via une
-- URL signée générée côté serveur.

-- =============================================================================
-- FIN — Rappel de sécurité :
--   NEXT_PUBLIC_SUPABASE_ANON_KEY : safe côté navigateur (protégée par RLS)
--   SUPABASE_SERVICE_ROLE_KEY     : SERVEUR UNIQUEMENT, ne jamais l'exposer
-- =============================================================================
