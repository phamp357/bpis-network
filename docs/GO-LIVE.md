# BPIS Network — Go-Live Runbook

This is the checklist for flipping from dev → production. Work top to bottom.

---

## 1. Create the Vercel project

1. Push the repo to GitHub (already done: `phamp357/bpis-network`).
2. Go to https://vercel.com/new → import `phamp357/bpis-network`.
3. Framework preset: Next.js (auto-detected). Leave defaults.
4. **Do not deploy yet** — add env vars first (next step).

## 2. Configure environment variables in Vercel

Vercel → Project → Settings → Environment Variables. Add each of these with the scope shown.

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Same value across all scopes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview, Development | Same value |
| `SUPABASE_SECRET_KEY` | Production, Preview, Development | **Mark as "sensitive"** |
| `ANTHROPIC_API_KEY` | Production, Preview, Development | Separate prod key recommended |
| `SENDGRID_API_KEY` | Production, Preview, Development | Separate prod key recommended |
| `SENDGRID_FROM_EMAIL` | Production, Preview, Development | Must be a verified sender identity in SendGrid |
| `ALLOWED_OPERATOR_EMAILS` | Production, Preview, Development | Comma-separated |
| `APP_ENV` | **Production only:** `prod` | Dev/Preview: `staging` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://your-custom-domain.com` |
| `STRIPE_SECRET_KEY` | Production (later) | Leave blank until ready to go live with payments |
| `STRIPE_WEBHOOK_SECRET` | Production (later) | Set after webhook endpoint is registered with Stripe |

> **Why `APP_ENV=prod` matters:** the seed scripts refuse to run against `APP_ENV=prod`. Keeping this set in production prevents anyone from accidentally dumping mock data into the live database.

## 3. Configure Supabase for production

### 3.1 URL configuration (Supabase → Authentication → URL Configuration)

- **Site URL:** `https://your-custom-domain.com`
- **Redirect URLs:** add every domain that can serve the app:
  - `https://your-custom-domain.com/auth/callback`
  - `https://*.vercel.app/auth/callback` *(for preview deploys)*
  - `http://localhost:3000/auth/callback` *(for local dev)*

### 3.2 Email provider

Supabase's default email provider is rate-limited. For production, wire Supabase Auth to SendGrid:

1. Supabase → Project Settings → Auth → SMTP Settings
2. Enable custom SMTP
3. Use SendGrid SMTP credentials (host `smtp.sendgrid.net`, port `587`, user `apikey`, password = your SendGrid API key)
4. Sender email must match `SENDGRID_FROM_EMAIL`

### 3.3 Backups

Supabase Pro ($25/mo per project) enables Point-in-Time Recovery (PITR) — **required for production**. The free tier only has daily logical backups with a 7-day retention, which is insufficient given the deal/UCC data here.

- Supabase → Project Settings → Database → Backups → enable PITR
- Target retention: 14 days

## 4. Deploy to Vercel

1. Go back to the Vercel project and click **Deploy**.
2. First deploy will run the build. Watch for errors.
3. Once live, add your custom domain: Settings → Domains.

## 5. First login on production

1. Visit the live URL.
2. Sign in with an email in `ALLOWED_OPERATOR_EMAILS`.
3. Open a terminal against the production Supabase project and run:
   ```bash
   npm run promote -- you@yourdomain.com
   ```
   *(Uses the same command, but with production `.env` values. Safer: use the dashboard SQL editor to run `update public.users set role = 'operator' where email = '...';` on the prod DB.)*

## 6. Before flipping to paid users

### Data
- [ ] `APP_ENV=prod` confirmed in Vercel
- [ ] Supabase PITR backup enabled and verified (trigger a test restore to staging)
- [ ] All seed data removed: run `select count(*) from users where is_mock = true;` — should be 0

### Auth
- [ ] Custom SMTP wired and tested
- [ ] Magic link email delivers within 30s
- [ ] `ALLOWED_OPERATOR_EMAILS` contains only real operators

### Payments (when you're ready to enable Stripe)
- [ ] Stripe products + prices created in live mode. Copy each `price_id`.
- [ ] Update `public.packages.stripe_price_id` for essential/builder/sovereign with the live price IDs.
- [ ] Add `STRIPE_SECRET_KEY` (live mode) to Vercel production env.
- [ ] Register the webhook endpoint in Stripe Dashboard:
  - URL: `https://your-domain.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
- [ ] Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel.
- [ ] Redeploy so the new env vars take effect.
- [ ] Smoke test: complete a real $1 test purchase, verify `purchases` row flips to `paid`.

### Security
- [ ] Rotate the Supabase secret key (dashboard → Project Settings → API → rotate). Update Vercel env.
- [ ] Rotate the Anthropic key that was shared in early-dev chat. Update Vercel env.
- [ ] Rotate the SendGrid key. Update Vercel env.
- [ ] Scan the repo for any accidentally committed secrets: `git log -p | grep -E 'sk_|sb_secret|SG\.'` — should return nothing.

### Observability
- [ ] Confirm events are being logged. Visit `/analytics` as operator — Recent activity should tick on every action.
- [ ] Set up Vercel log drain or observability integration if you want alerting.

## 7. Ongoing operations

### Database migrations
Never edit production schema from the Supabase dashboard. Every change:
```bash
npx supabase migration new <name>
# edit the generated SQL file
npm run db:push
```
The Supabase CLI applies migrations in order and records them in `supabase_migrations.schema_migrations` so reruns are safe.

### Regenerating types after a migration
```bash
npm run db:types
```

### Emergency: roll back a bad deploy
Vercel → Deployments → find the last good one → "Promote to production".

### Clearing test data from production (never routinely)
The `seed:clear` script is hard-blocked when `APP_ENV=prod`. If you ever need to clean production, remove the `APP_ENV` check in `seed/_common.ts` temporarily — but think very hard about why.

---

## Rollback plan

If a deploy is broken and you can't roll back via Vercel:

1. Revert the bad commit locally: `git revert <sha> && git push`
2. Vercel auto-deploys the revert.
3. If the DB was schema-mutated, restore the last good PITR snapshot from Supabase. This loses intervening data — communicate with any active operators before firing.

## First-time responder checklist (when something is on fire)

- [ ] Check Vercel deployment status
- [ ] Check Supabase status page (https://status.supabase.com)
- [ ] Check Anthropic status (https://status.anthropic.com)
- [ ] Check `/analytics` for the last event — confirms app can reach DB
- [ ] If a single agent is failing: check the Vercel function logs for `[ORACLE|COVENANT|OOCEMR]` errors
