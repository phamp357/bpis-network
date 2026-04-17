-- Content assets and knowledge library.

-- === Enums ===
create type public.content_asset_type as enum (
  'social_post',
  'objection_response',
  'prospect_intel',
  'email_draft',
  'script'
);

-- === content_assets (Intelligence Suite outputs) ===
create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  asset_type public.content_asset_type not null,
  prompt text not null,
  output text not null,
  brand_voice_snapshot jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_assets_user_id_idx on public.content_assets(user_id);
create index content_assets_asset_type_idx on public.content_assets(asset_type);
create index content_assets_is_mock_idx on public.content_assets(is_mock) where is_mock = true;

create trigger content_assets_set_updated_at
  before update on public.content_assets
  for each row execute function public.set_updated_at();

-- === knowledge_articles (Kingdom Strategy, IUL Framework reference content) ===
create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  body_md text not null default '',
  published boolean not null default false,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_articles_category_idx on public.knowledge_articles(category);
create index knowledge_articles_published_idx on public.knowledge_articles(published) where published = true;
create index knowledge_articles_is_mock_idx on public.knowledge_articles(is_mock) where is_mock = true;

create trigger knowledge_articles_set_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();
