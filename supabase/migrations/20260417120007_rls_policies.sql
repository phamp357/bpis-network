-- Row-Level Security policies.
--
-- Model:
--   - operator/admin users see everything (full access)
--   - founder/partner users see only their own data
--   - reference tables (packages, knowledge_articles): readable by all authed users;
--     writable only by operator/admin
--   - service_role (and sb_secret_*) bypasses RLS entirely — used by seed scripts
--     and server-side admin operations

-- === Helper: is the current user an operator/admin? ===
create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('operator', 'admin')
  );
$$;

-- === Enable RLS on all tables ===
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.packages enable row level security;
alter table public.assessments enable row level security;
alter table public.recommendations enable row level security;
alter table public.deals enable row level security;
alter table public.capital_stack_items enable row level security;
alter table public.ucc_filings enable row level security;
alter table public.partners enable row level security;
alter table public.partner_engagements enable row level security;
alter table public.content_assets enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.events enable row level security;

-- === users ===
create policy "users: self or operator can select"
  on public.users for select
  using (id = auth.uid() or public.is_operator());

create policy "users: self can update own profile"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users: operator can update anyone"
  on public.users for update
  using (public.is_operator())
  with check (public.is_operator());

create policy "users: operator can delete"
  on public.users for delete
  using (public.is_operator());

-- === organizations ===
create policy "organizations: owner or operator select"
  on public.organizations for select
  using (user_id = auth.uid() or public.is_operator());

create policy "organizations: owner or operator insert"
  on public.organizations for insert
  with check (user_id = auth.uid() or public.is_operator());

create policy "organizations: owner or operator update"
  on public.organizations for update
  using (user_id = auth.uid() or public.is_operator())
  with check (user_id = auth.uid() or public.is_operator());

create policy "organizations: owner or operator delete"
  on public.organizations for delete
  using (user_id = auth.uid() or public.is_operator());

-- === packages (reference data — read-all, write-operator) ===
create policy "packages: authed users can select"
  on public.packages for select
  to authenticated
  using (true);

create policy "packages: operator can write"
  on public.packages for all
  using (public.is_operator())
  with check (public.is_operator());

-- === assessments ===
create policy "assessments: owner or operator select"
  on public.assessments for select
  using (user_id = auth.uid() or public.is_operator());

create policy "assessments: owner or operator insert"
  on public.assessments for insert
  with check (user_id = auth.uid() or public.is_operator());

create policy "assessments: owner or operator update"
  on public.assessments for update
  using (user_id = auth.uid() or public.is_operator())
  with check (user_id = auth.uid() or public.is_operator());

create policy "assessments: operator delete"
  on public.assessments for delete
  using (public.is_operator());

-- === recommendations (follows the parent assessment's user) ===
create policy "recommendations: owner or operator select"
  on public.recommendations for select
  using (
    public.is_operator() or
    exists (select 1 from public.assessments a where a.id = assessment_id and a.user_id = auth.uid())
  );

create policy "recommendations: operator write"
  on public.recommendations for all
  using (public.is_operator())
  with check (public.is_operator());

-- === deals ===
create policy "deals: owner or operator select"
  on public.deals for select
  using (owner_user_id = auth.uid() or public.is_operator());

create policy "deals: owner or operator insert"
  on public.deals for insert
  with check (owner_user_id = auth.uid() or public.is_operator());

create policy "deals: owner or operator update"
  on public.deals for update
  using (owner_user_id = auth.uid() or public.is_operator())
  with check (owner_user_id = auth.uid() or public.is_operator());

create policy "deals: owner or operator delete"
  on public.deals for delete
  using (owner_user_id = auth.uid() or public.is_operator());

-- === capital_stack_items (scoped by parent deal) ===
create policy "capital_stack_items: owner or operator select"
  on public.capital_stack_items for select
  using (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  );

create policy "capital_stack_items: owner or operator write"
  on public.capital_stack_items for all
  using (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  )
  with check (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  );

-- === ucc_filings (scoped by parent deal) ===
create policy "ucc_filings: owner or operator select"
  on public.ucc_filings for select
  using (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  );

create policy "ucc_filings: owner or operator write"
  on public.ucc_filings for all
  using (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  )
  with check (
    public.is_operator() or
    exists (select 1 from public.deals d where d.id = deal_id and d.owner_user_id = auth.uid())
  );

-- === partners (directory — operator-managed) ===
create policy "partners: authed users can select"
  on public.partners for select
  to authenticated
  using (true);

create policy "partners: operator write"
  on public.partners for all
  using (public.is_operator())
  with check (public.is_operator());

-- === partner_engagements ===
create policy "partner_engagements: owner or operator select"
  on public.partner_engagements for select
  using (user_id = auth.uid() or public.is_operator());

create policy "partner_engagements: owner or operator insert"
  on public.partner_engagements for insert
  with check (user_id = auth.uid() or public.is_operator());

create policy "partner_engagements: owner or operator update"
  on public.partner_engagements for update
  using (user_id = auth.uid() or public.is_operator())
  with check (user_id = auth.uid() or public.is_operator());

create policy "partner_engagements: owner or operator delete"
  on public.partner_engagements for delete
  using (user_id = auth.uid() or public.is_operator());

-- === content_assets ===
create policy "content_assets: owner or operator select"
  on public.content_assets for select
  using (user_id = auth.uid() or public.is_operator());

create policy "content_assets: owner or operator insert"
  on public.content_assets for insert
  with check (user_id = auth.uid() or public.is_operator());

create policy "content_assets: owner or operator update"
  on public.content_assets for update
  using (user_id = auth.uid() or public.is_operator())
  with check (user_id = auth.uid() or public.is_operator());

create policy "content_assets: owner or operator delete"
  on public.content_assets for delete
  using (user_id = auth.uid() or public.is_operator());

-- === knowledge_articles (reference data — read published, write operator) ===
create policy "knowledge_articles: read published"
  on public.knowledge_articles for select
  to authenticated
  using (published or public.is_operator());

create policy "knowledge_articles: operator write"
  on public.knowledge_articles for all
  using (public.is_operator())
  with check (public.is_operator());

-- === events (append-only; only operator can read all, users see their own) ===
create policy "events: self or operator select"
  on public.events for select
  using (user_id = auth.uid() or public.is_operator());

create policy "events: authed can insert own"
  on public.events for insert
  with check (user_id = auth.uid() or public.is_operator());

-- No update/delete policies on events — immutable by design.
