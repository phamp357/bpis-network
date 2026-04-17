-- Append-only event log for analytics and audit.
-- Never update or delete rows here — treat as immutable.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  is_mock boolean not null default false,
  occurred_at timestamptz not null default now()
);

create index events_user_id_idx on public.events(user_id);
create index events_event_type_idx on public.events(event_type);
create index events_entity_idx on public.events(entity_type, entity_id);
create index events_occurred_at_idx on public.events(occurred_at desc);
create index events_is_mock_idx on public.events(is_mock) where is_mock = true;
