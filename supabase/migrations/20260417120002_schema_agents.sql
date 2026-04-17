-- Agent schema: packages, assessments, recommendations
-- Supports COVENANT, ORACLE, and future intake agents.

-- === Enums ===
create type public.agent_type as enum ('covenant', 'oracle', 'iul', 'ucc', 'intelligence');

create type public.assessment_status as enum ('draft', 'submitted', 'analyzed');

create type public.readiness_tier as enum ('foundation', 'activation', 'mastery');

create type public.package_code as enum ('essential', 'builder', 'sovereign');

-- === packages (reference data — COVENANT offerings) ===
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  code public.package_code not null unique,
  name text not null,
  description text,
  price numeric(10, 2),
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger packages_set_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- === assessments (intake records — COVENANT, ORACLE, etc.) ===
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  agent_type public.agent_type not null,
  status public.assessment_status not null default 'draft',
  responses jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_user_id_idx on public.assessments(user_id);
create index assessments_agent_type_idx on public.assessments(agent_type);
create index assessments_is_mock_idx on public.assessments(is_mock) where is_mock = true;

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- === recommendations (agent output) ===
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  recommended_package_id uuid references public.packages(id) on delete set null,
  readiness_tier public.readiness_tier,
  score int check (score between 0 and 100),
  strategy_notes text,
  raw_ai_output jsonb,
  is_mock boolean not null default false,
  created_at timestamptz not null default now()
);

create index recommendations_assessment_id_idx on public.recommendations(assessment_id);
create index recommendations_is_mock_idx on public.recommendations(is_mock) where is_mock = true;
