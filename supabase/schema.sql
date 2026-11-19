-- PizzaVoice — schéma Supabase
-- À coller dans Supabase → SQL Editor → New query → Run.
-- Ordre imposé : CREATE TABLE, puis index, puis RLS, puis GRANT.
-- L'application parle à Supabase avec la clé service_role (côté serveur uniquement) :
-- RLS protège quand même les données si la clé anon fuite un jour.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------ users
create table if not exists public.pv_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------- locations
create table if not exists public.pv_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.pv_users(id) on delete cascade,
  name text not null default '',
  address text not null default '',
  postal_code text not null default '',
  city text not null default '',
  cuisine text not null default 'Italienne',
  phone text not null default '',
  menu jsonb not null default '[]'::jsonb,
  hours jsonb not null default '[]'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','active')),
  test_number text not null default '',
  twilio_number text not null default '',
  onboarding_step int not null default 1,
  created_at timestamptz not null default now()
);
create unique index if not exists pv_locations_user_id_key on public.pv_locations(user_id);
create index if not exists pv_locations_twilio_idx on public.pv_locations(twilio_number);

-- --------------------------------------------------------------- sessions
create table if not exists public.pv_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.pv_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists pv_sessions_user_idx on public.pv_sessions(user_id);

-- ----------------------------------------------------------------- orders
create table if not exists public.pv_orders (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.pv_locations(id) on delete cascade,
  reference text not null,
  token text not null unique,
  customer_name text not null default '',
  phone text not null default '',
  address text not null default '',
  mode text not null default 'pickup' check (mode in ('delivery','pickup','dine-in')),
  lines jsonb not null default '[]'::jsonb,
  subtotal_cents int not null default 0,
  delivery_fee_cents int not null default 0,
  total_cents int not null default 0,
  status text not null default 'new'
    check (status in ('new','preparing','ready','delivering','delivered','cancelled')),
  driver_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pv_orders_location_idx on public.pv_orders(location_id, created_at desc);

-- ---------------------------------------------------------------- drivers
create table if not exists public.pv_drivers (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.pv_locations(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists pv_drivers_location_idx on public.pv_drivers(location_id);

-- -------------------------------------------------------------------- RLS
alter table public.pv_users     enable row level security;
alter table public.pv_locations enable row level security;
alter table public.pv_sessions  enable row level security;
alter table public.pv_orders    enable row level security;
alter table public.pv_drivers   enable row level security;

-- Aucune politique publique : le serveur passe par service_role, qui ignore RLS.
-- Si un jour le front parle directement à Supabase avec la clé anon, ajouter ici
-- des politiques `auth.uid() = user_id` et remplacer le hash maison par Supabase Auth.

-- ------------------------------------------------------------------ grants
grant usage on schema public to anon, authenticated, service_role;

-- Le rôle anon n'a aucun accès aux tables : tout passe par le serveur.
revoke all on public.pv_users, public.pv_sessions from anon, authenticated;
grant select, insert, update, delete on public.pv_locations, public.pv_orders, public.pv_drivers
  to authenticated;

-- Le serveur utilise service_role : sans ces GRANT explicites, Postgres refuse
-- l'accès même avec BYPASSRLS (RLS et privilèges sont deux couches distinctes).
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
