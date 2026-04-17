-- Partner network: IUL advisors and other professional partners.

-- === Enums ===
create type public.partner_type as enum ('iul_advisor', 'legal', 'cpa', 'broker', 'other');

create type public.vetting_status as enum ('pending', 'in_review', 'approved', 'rejected');

-- === partners ===
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  -- nullable: partner may not yet have a login account
  user_id uuid references public.users(id) on delete set null,
  type public.partner_type not null,
  full_name text not null,
  company text,
  email text,
  phone text,
  license_number text,
  license_state text,
  vetting_status public.vetting_status not null default 'pending',
  vetting_notes text,
  compliance_docs jsonb not null default '[]'::jsonb,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partners_type_idx on public.partners(type);
create index partners_vetting_status_idx on public.partners(vetting_status);
create index partners_user_id_idx on public.partners(user_id);
create index partners_is_mock_idx on public.partners(is_mock) where is_mock = true;

create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

-- === partner_engagements (M:M user ↔ partner) ===
create table public.partner_engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  engagement_type text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, partner_id, engagement_type)
);

create index partner_engagements_user_id_idx on public.partner_engagements(user_id);
create index partner_engagements_partner_id_idx on public.partner_engagements(partner_id);
create index partner_engagements_is_mock_idx on public.partner_engagements(is_mock) where is_mock = true;

create trigger partner_engagements_set_updated_at
  before update on public.partner_engagements
  for each row execute function public.set_updated_at();
