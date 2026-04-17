# Seed Data

Mock data lives here. Every row inserted by a seed script **must** include `is_mock: true`.

## Rules

1. Seeds only run when `APP_ENV !== "prod"`. Scripts will refuse to execute against production.
2. Every table has an `is_mock` column. All seeded rows set it to `true`.
3. `npm run seed:clear` (added in Phase 2) deletes every row where `is_mock = true` — one command, clean slate.
4. Never mix seed code into app code. This folder is the only source of mock data.

## Structure (added in Phase 2)

```
seed/
  index.ts           # orchestrator — runs all seeders in order
  seed-users.ts
  seed-organizations.ts
  seed-packages.ts
  seed-assessments.ts
  seed-deals.ts
  seed-partners.ts
  seed-content.ts
  seed-knowledge.ts
  clear.ts           # deletes all is_mock=true rows
```
