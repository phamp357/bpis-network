# BPIS Network

Black Phenomenon Intelligence Suite — operator console for The Black Phenomenon.
Integrates Kingdom-centered entrepreneurship tooling: COVENANT legal intake, ORACLE
activation profiles, Command Dashboard, UCC Wealth Engine, IUL partner network,
and the Intelligence Suite content generator.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database / Auth / Storage:** Supabase (Postgres)
- **AI agents:**
  - Claude Sonnet 4.6 — fast agents (COVENANT, ORACLE, content, intake)
  - Claude Opus 4.7 — deep reasoning (UCC Wealth Engine, deal analysis)
- **Email:** SendGrid
- **Payments (Phase 9):** Stripe — infrastructure stubbed, not wired yet
- **Hosting:** Vercel

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in your keys
npm run dev                    # http://localhost:3000
```

## Environments

Environment separation is handled by Vercel, not multiple `.env` files:

- **dev** — your local machine, `APP_ENV=dev`, seeded with mock data
- **staging** — Vercel preview deployments, `APP_ENV=staging`, seeded with mock data
- **prod** — Vercel production, `APP_ENV=prod`, **no seeds ever run**

Seed scripts (added in Phase 2) refuse to execute when `APP_ENV=prod`.

## Mock data strategy

- Every table has an `is_mock` boolean column
- Every seeded row sets `is_mock = true`
- `npm run seed:clear` deletes all `is_mock = true` rows in one pass
- Going live = run `seed:clear` against prod once (or simply never seed prod)

See `seed/README.md` for details.

## Project structure

```
app/                 # Next.js App Router routes
lib/
  supabase/          # client.ts, server.ts, admin.ts
  claude/            # Anthropic client + model routing
  email/             # SendGrid client
seed/                # mock data scripts (Phase 2)
_reference/          # original HTML prototypes — source material for page porting
```

## Build phases

- **Phase 0 — Setup** ✅ (you are here)
- **Phase 1 — Auth + app shell** (Supabase Auth, operator-only access)
- **Phase 2 — Schema + seeds** (migrations, RLS, mock data)
- **Phase 3 — Port static pages** (Kingdom Strategy, IUL Education)
- **Phase 4 — ORACLE agent** (first live agent end-to-end)
- **Phase 5 — COVENANT agent + packages**
- **Phase 6 — Intelligence Suite** (content generators)
- **Phase 7 — Partner directory** (IUL advisors + vetting)
- **Phase 8 — Deal workspace** (Command Dashboard + UCC Wealth Engine)
- **Phase 9 — Analytics + Stripe + go-live prep**

## Deploying to Vercel

1. Push this repo to GitHub
2. Import the repo at https://vercel.com/new
3. Add env vars from `.env.example` in Project Settings → Environment Variables
   (split into Production / Preview / Development)
4. Deploy
