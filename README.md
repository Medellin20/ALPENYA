# ALPENYA

**Plateforme professionnelle de gestion et de location de chalets et villas en France.**

ALPENYA permet de publier des chalets et villas, gérer les demandes de visite, les réservations, les paiements de garantie et les remboursements — avec un espace client et un tableau de bord administrateur intégré.

---

## Stack technique

| Couche        | Technologie                                      |
| ------------- | ------------------------------------------------ |
| Frontend      | Next.js 14 (App Router), React 18, TypeScript    |
| Styles        | Tailwind CSS 3.4 + `@tailwindcss/typography`     |
| Police        | Open Sans (`next/font/google`)                   |
| Animations    | Framer Motion                                    |
| Formulaires   | React Hook Form + Zod                            |
| Icônes        | Lucide React                                     |
| Notifications | Sonner                                           |
| Backend       | Next.js Server Actions + Route Handlers          |
| Base de données | Supabase (PostgreSQL, Storage, RLS)            |
| Paiements     | Stripe Checkout (carte + iDEAL) — optionnel      |
| Authentification admin | Cookie signé HMAC-SHA256 + rate limiting |

---

## Installation

### Prérequis

- **Node.js ≥ 18.18** et **npm**
- Un projet **Supabase** (gratuit sur [supabase.com](https://supabase.com))
- (Optionnel) Un compte **Stripe** pour le paiement en ligne des frais de visite

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copiez le fichier d'exemple et renseignez vos clés :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ADMIN_PASSWORD=Hublot@1233
ADMIN_SESSION_SECRET=generez-une-longue-chaine-aleatoire-ici

# Alertes Gmail pour les demandes de visite et les réservations
GMAIL_USER=votre-compte@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
ALERT_EMAIL=alertes@votre-domaine.com

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Important :** `.env.local` ne doit **jamais** être commité. Il est exclu via `.gitignore`.

Pour recevoir les alertes Gmail lors d'une demande de visite ou d'une réservation, utilisez un compte Gmail avec un mot de passe d'application (Google Account > Sécurité > Vérification en 2 étapes > Mots de passe d'application). La variable `GMAIL_APP_PASSWORD` doit contenir ce mot de passe à 16 caractères, et `ALERT_EMAIL` doit être l'adresse qui reçoit les notifications.

### 3. Créer la base de données

Dans le **SQL Editor** de votre projet Supabase, exécutez dans l'ordre :

1. `supabase/schema.sql` — tables, enums, triggers, buckets Storage
2. `supabase/rls_policies.sql` — politiques Row Level Security
3. `supabase/seed.sql` — catalogue d’équipements uniquement, sans appartement ni photo standard

Pour repartir plus tard avec une base vide sans supprimer sa structure, exécutez
`supabase/reset_data.sql` dans le SQL Editor Supabase. Le script conserve les
équipements et la configuration bancaire, et efface les données métier ainsi que
les fichiers des buckets applicatifs.

### 4. Configurer Supabase Storage

Les scripts SQL créent automatiquement les buckets nécessaires :
- `property-images` (public en lecture) — photos des logements
- `payment-proofs` (privé) — justificatifs de virement

Vérifiez dans votre tableau de bord Supabase que ces buckets existent bien sous **Storage**.

### 5. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Accès administrateur

Rendez-vous sur [http://localhost:3000/admin](http://localhost:3000/admin).

**Mot de passe initial :** `Hublot@1233` (défini via la variable `ADMIN_PASSWORD`).

Ce mot de passe n'est **jamais** codé en dur dans le code source ou les composants — il est lu exclusivement côté serveur depuis les variables d'environnement. L'authentification repose sur un cookie `httpOnly` signé en HMAC-SHA256, et les tentatives de connexion sont limitées à 5 par fenêtre de 15 minutes par IP.

---

## Architecture du projet

```text
app/
  (public)/             Pages publiques (accueil, catalogue, détail, visite, réservation, mon-compte…)
  admin/
    (auth)/login/       Page de connexion admin (pas de sidebar)
    (dashboard)/        Dashboard admin avec sidebar (appartements, visites, réservations…)
  api/
    admin/export/       Export CSV des réservations
    webhooks/stripe/    Webhook Stripe pour les paiements de frais de visite
  sitemap.ts            Sitemap XML dynamique
  robots.ts             Fichier robots.txt

actions/                Server Actions (créer/modifier/supprimer des ressources, auth admin…)
components/
  ui/                   Composants UI réutilisables (Button, Input, Modal, Badge…)
  layout/               Navbar, Footer
  properties/           PropertyCard, PropertyGrid, Gallery, Filters…
  forms/                Formulaires de visite, réservation, contact, garantie…
  admin/                Sidebar, PropertyForm, ImageUploader, StatCard…
  shared/               Composants partagés (BankTransferInstructions, StatusTimeline, Accordion…)

lib/
  supabase/             Clients Supabase (client/server/admin), middleware
  auth/                 Session admin signée, rate limiting
  data/                 Fonctions de lecture des données (queries Supabase côté serveur)
  validations/          Schémas Zod pour chaque formulaire
  payments/             Abstraction Stripe (PaymentProvider)
  utils/                Formatage, slugification, constantes, génération de références

types/                  Types TypeScript miroir du schéma Supabase
hooks/                  Hooks React (favoris, debounce, media query)
supabase/               Scripts SQL (schema, RLS, seed)
```

---

## Fonctionnalités

### Côté public

- **Catalogue** filtré par ville, prix, chambres, type, ameublement — tri + pagination — filtres conservés dans l'URL
- **Moteur de recherche** intégré dans le hero de la page d'accueil
- **Fiche logement** avec galerie plein écran, équipements, carte OpenStreetMap, logements similaires, données structurées JSON-LD
- **Demande de visite** multi-étapes (date → coordonnées → paiement Stripe Checkout ou confirmation)
- **Réservation** de logement (dossier locataire avec profession, revenus, durée…)
- **Espace client** (`/mon-compte`) — suivi des visites, réservations, garanties avec timeline visuelle, déclaration de virement, demande de remboursement
- **Favoris** (localStorage, sans compte obligatoire)
- **Partage** d'un logement (Web Share API / clipboard)
- Pages : Comment ça marche, À propos, Contact (formulaire enregistré en BDD), FAQ, Mentions légales, Confidentialité, CGU

### Côté admin (`/admin`)

- **Dashboard** avec 10 indicateurs clés et journal d'activité
- **CRUD appartements** complet : création, modification, suppression, changement de statut, publication/dépublication
- **Upload d'images** vers Supabase Storage : multi-upload, progression, sélection de l'image principale, réordonnancement, suppression
- **Gestion des visites** : filtrage par statut, changement de statut
- **Gestion des réservations** : filtrage, statut, export CSV
- **Gestion des garanties** : validation de réception du virement, progression du dossier
- **Gestion des remboursements** : approbation, traitement, confirmation
- **Liste des clients** avec recherche
- **Configuration bancaire** : IBAN, BIC, banque, instructions — modifiables en temps réel
- **Journal d'audit** (`admin_logs`) de toutes les actions admin

---

## Paiements

### Frais de visite

Réglés via **Stripe Checkout** (carte bancaire + iDEAL). Pour activer :

1. Renseignez `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `STRIPE_WEBHOOK_SECRET` dans `.env.local`.
2. Configurez le webhook dans le [tableau de bord Stripe](https://dashboard.stripe.com/webhooks) avec l'URL : `https://votre-domaine.com/api/webhooks/stripe` et l'événement `checkout.session.completed`.

Si Stripe n'est pas configuré, les demandes de visite sont tout de même enregistrées en base (statut `pending`), et le client est redirigé vers une page de confirmation qui l'informe que le paiement lui sera communiqué séparément.

### Garantie de réservation

Gérée par **virement bancaire classique** (conformément au cahier des charges). Les coordonnées bancaires sont stockées dans la table `bank_settings` et modifiables depuis `/admin/configuration-bancaire`. L'IBAN n'est jamais codé en dur dans le code. Le client déclare son virement et peut joindre un justificatif ; l'administrateur valide manuellement la réception.

### Remboursement

L'application gère la **demande et le suivi administratif** du remboursement. Aucun virement automatique n'est effectué (aucune API bancaire n'est intégrée) — le statut « remboursé » confirme que le virement a été réalisé manuellement par l'agence.

---

## Sécurité

- **Row Level Security (RLS)** activée sur toutes les tables : un visiteur anonyme ne peut lire que les biens publiés et ne peut ni modifier ni supprimer aucune donnée
- **Clé `SUPABASE_SERVICE_ROLE_KEY`** utilisée uniquement côté serveur (import `server-only`) et jamais exposée au navigateur
- **Mot de passe admin** stocké en variable d'environnement serveur, comparé en temps constant
- **Cookie de session admin** `httpOnly`, `secure` en production, `sameSite: lax`, signé HMAC-SHA256
- **Rate limiting** des tentatives de connexion (5 essais / 15 min par IP)
- **Middleware Next.js** qui bloque l'accès à `/admin/*` si le cookie de session est absent ou invalide
- **Honeypot anti-spam** sur tous les formulaires publics
- **Validation Zod** côté serveur sur chaque Server Action

---

## SEO

- Metadata Next.js avec `title`, `description`, Open Graph
- Sitemap XML dynamique (`/sitemap.xml`) incluant toutes les pages publiques et tous les logements publiés
- `robots.txt` excluant `/admin`, `/api`, `/mon-compte`
- Slugs propres : `/appartements/amsterdam-modern-apartment-centrum`
- Données structurées JSON-LD (Schema.org `Apartment`) sur chaque fiche logement

---

## Responsive

L'application est conçue en mobile-first. Chaque composant est testé pour fonctionner correctement sur :

- Smartphone (360px+)
- Tablette (768px+)
- Laptop (1024px+)
- Grand écran (1440px+)

Les tableaux admin passent en mode « cartes empilées » sur mobile.

---

## Déploiement

### Netlify

Le dépôt contient un fichier `netlify.toml` configuré pour Next.js 14 avec le
runtime Netlify. Dans Netlify :

1. Importez le dépôt GitHub et laissez Netlify lire `netlify.toml`.
2. Ajoutez les variables de `.env.example` dans **Site configuration → Environment variables**.
3. Déployez une première fois, puis remplacez `NEXT_PUBLIC_SITE_URL` par l'URL
   publique finale et relancez le déploiement.
4. Si Stripe est activé, configurez son webhook vers
   `https://votre-domaine/api/webhooks/stripe` pour l'événement
   `checkout.session.completed`, puis renseignez `STRIPE_WEBHOOK_SECRET`.

Ne copiez jamais `.env.local` dans Git et n'exposez jamais
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` ou `ADMIN_SESSION_SECRET` avec un
préfixe `NEXT_PUBLIC_`.

### Vercel

1. Importez le repository dans Vercel.
2. Ajoutez les variables d'environnement (identiques à `.env.local`).
3. Déployez — Vercel détecte automatiquement Next.js.

### Autres plateformes

L'application fonctionne partout où Node.js 18+ est disponible. Exécutez :

```bash
npm run build
npm start
```

---

## Scripts disponibles

| Commande        | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Lance le serveur de développement            |
| `npm run build` | Compile l'application pour la production     |
| `npm start`     | Lance le serveur de production               |
| `npm run lint`  | Vérifie le code avec ESLint                  |
| `npm run typecheck` | Vérifie les types TypeScript             |

---

## Licence

Projet propriétaire — Real Estate NL. Tous droits réservés.
