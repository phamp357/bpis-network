-- Core schema: enums, users, organizations
-- Every table includes is_mock for easy seed cleanup.

-- === Extensions ===
create extension if not exists pgcrypto;

-- === Enums ===
create type public.user_role as enum ('operator', 'admin', 'founder', 'partner_iul');

create type public.org_stage as enum ('idea', 'pre_revenue', 'early', 'growth', 'mature');

-- === updated_at trigger helper ===
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- === users (extends auth.users) ===
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'founder',
  brand_voice jsonb not null default '{}'::jsonb,
  kingdom_profile jsonb not null default '{}'::jsonb,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index users_is_mock_idx on public.users(is_mock) where is_mock = true;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create public.users row when a new auth.users row is inserted.
-- New signups default to 'founder' role. Promote to 'operator'/'admin' manually.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- === organizations ===
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  legal_name text not null,
  entity_type text,
  state_of_formation text,
  stage public.org_stage not null default 'idea',
  team_size int,
  funding_goal numeric(18, 2),
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_user_id_idx on public.organizations(user_id);
create index organizations_is_mock_idx on public.organizations(is_mock) where is_mock = true;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
