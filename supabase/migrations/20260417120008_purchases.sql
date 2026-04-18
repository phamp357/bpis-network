-- Purchases + Stripe scaffolding.
-- Infrastructure only — wired but gated in app code until STRIPE_SECRET_KEY is set.

-- === Enum ===
create type public.purchase_status as enum ('pending', 'paid', 'refunded', 'failed', 'canceled');

-- === packages: add stripe_price_id ===
alter table public.packages add column if not exists stripe_price_id text;

-- === purchases ===
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  package_id uuid references public.packages(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_payment_intent_id text unique,
  amount_cents int,
  currency text default 'usd',
  status public.purchase_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_package_id_idx on public.purchases(package_id);
create index purchases_status_idx on public.purchases(status);
create index purchases_stripe_session_idx on public.purchases(stripe_checkout_session_id);
create index purchases_is_mock_idx on public.purchases(is_mock) where is_mock = true;

create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

alter table public.purchases enable row level security;

create policy "purchases: owner or operator select"
  on public.purchases for select
  using (user_id = auth.uid() or public.is_operator());

create policy "purchases: operator write"
  on public.purchases for all
  using (public.is_operator())
  with check (public.is_operator());
-- Note: Stripe webhook writes via service_role which bypasses RLS.
