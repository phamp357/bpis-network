-- Deal workspace: deals, capital stack items, UCC filings
-- Powers the Command Dashboard (Phase 8) and UCC Wealth Engine.

-- === Enums ===
create type public.deal_phase as enum ('phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5');

create type public.deal_status as enum ('active', 'closed', 'dead', 'paused');

create type public.capital_tier as enum ('senior_debt', 'mezzanine', 'equity', 'ucc_secured', 'seller_financing');

create type public.ucc_filing_status as enum ('draft', 'filed', 'amended', 'terminated');

-- === deals ===
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  target_entity text,
  phase public.deal_phase not null default 'phase_1',
  status public.deal_status not null default 'active',
  oocemr_analysis jsonb not null default '{}'::jsonb,
  estimated_value numeric(18, 2),
  notes text,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_owner_user_id_idx on public.deals(owner_user_id);
create index deals_phase_idx on public.deals(phase);
create index deals_status_idx on public.deals(status);
create index deals_is_mock_idx on public.deals(is_mock) where is_mock = true;

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- === capital_stack_items ===
create table public.capital_stack_items (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  tier public.capital_tier not null,
  source text not null,
  amount numeric(18, 2) not null,
  terms jsonb not null default '{}'::jsonb,
  order_index int not null default 0,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index capital_stack_items_deal_id_idx on public.capital_stack_items(deal_id);
create index capital_stack_items_is_mock_idx on public.capital_stack_items(is_mock) where is_mock = true;

create trigger capital_stack_items_set_updated_at
  before update on public.capital_stack_items
  for each row execute function public.set_updated_at();

-- === ucc_filings ===
create table public.ucc_filings (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  filing_state text not null,
  filing_number text,
  debtor text not null,
  secured_party text not null,
  collateral_description text,
  filed_at timestamptz,
  status public.ucc_filing_status not null default 'draft',
  document_url text,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ucc_filings_deal_id_idx on public.ucc_filings(deal_id);
create index ucc_filings_status_idx on public.ucc_filings(status);
create index ucc_filings_is_mock_idx on public.ucc_filings(is_mock) where is_mock = true;

create trigger ucc_filings_set_updated_at
  before update on public.ucc_filings
  for each row execute function public.set_updated_at();
