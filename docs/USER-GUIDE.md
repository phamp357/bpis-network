# BPIS Network — Operator User Guide

This guide walks through every part of the BPIS Network operator console — what each section does, when to use it, and how to move through the most common workflows.

**Audience:** operators of the platform (you and anyone you invite). If you're a client who received an assessment link, skip to [For clients](#for-clients) at the bottom.

---

## 1. Getting started

### Signing in

1. Open the app URL in your browser.
2. Enter your email on the sign-in screen.
3. Click **Send magic link**.
4. Check your inbox. Click the link in the email within 5 minutes.
5. You land on the **Dashboard**.

**If the email doesn't arrive:**
- Check spam / promotions
- Make sure your email is in the operator allow-list (admin must add you)
- Request a new link — old ones expire after 5 minutes

### Your role

Every operator has a role stored with their profile. Roles determine what you can see and edit:

- **operator** / **admin** — full access to every feature, every client's data
- **founder** — can see only their own assessments, deals, and content
- **partner_iul** — limited partner-facing view (reserved for future)

You'll almost always be an **operator**. If you need to promote another user, see [Admin tasks](#admin-tasks).

### The sidebar

The left sidebar is organized into five groups:

| Group | What's in it |
|---|---|
| **Overview** | Dashboard, Analytics |
| **Agents** | ORACLE, COVENANT, Intelligence Suite |
| **Deal Workspace** | Command Dashboard, UCC Wealth Engine |
| **Partner Network** | IUL Partners |
| **Library** | Kingdom Strategy, IUL Framework |

Each item shows a phase tag (P1–P9) indicating which build phase owned it — useful for reference but not for daily use.

---

## 2. The typical client intake flow

This is the most common workflow you'll run. It has three stages:

### Stage 1 — Assess readiness with ORACLE

**When:** a new prospect has had their first conversation and you want a structured read on their readiness.

1. Click **ORACLE** in the sidebar.
2. Click **New assessment** (top-right).
3. Fill out the 7 questions:
   - Current revenue stage (multiple choice)
   - Primary bottleneck
   - Team structure
   - Spiritual alignment & practice
   - 12-month goal
   - Biggest risk or blocker
   - Ideal 2-year outcome
4. Click **Submit for analysis**. ORACLE runs for 10–15 seconds.
5. You land on the results page, which shows:
   - **Readiness tier** — Foundation / Activation / Mastery
   - **Score** — 0 to 100
   - **Strategy notes** — 3–5 sentences of specific next moves
   - All responses for reference

**What the tiers mean:**

- **Foundation (0–49)** — the operator needs to build discipline, clarity, or core business fundamentals before scaling. Entry-level offerings.
- **Activation (50–79)** — baseline is solid; work is systems, team, and reinvestment. Middle-tier services.
- **Mastery (80–100)** — fundamentals in place; focus shifts to legacy, acquisition, and capital structuring. Premium offerings.

The ORACLE list view shows every past assessment with tier + score — useful for reviewing a prospect before a second call.

### Stage 2 — Recommend a legal package with COVENANT

**When:** the prospect is ready to commit to a legal foundation package. Usually runs after ORACLE for high-scoring prospects.

1. Click **COVENANT** in the sidebar.
2. Click **New assessment**.
3. Fill out the 6 questions:
   - Business stage
   - Team size (number)
   - State of formation (e.g., TX)
   - Current legal foundation
   - Funding goal
   - Primary legal concern
4. Submit. COVENANT runs for 10–15 seconds.
5. The result page shows:
   - **Recommended package** — Essential, Builder, or Sovereign
   - **Confidence score** (0–100)
   - **What's included** in the package
   - **Strategy notes** citing the prospect's specific situation
   - A **Purchase package** button (gated until Stripe is enabled)

### Stage 3 — Purchase

**When Stripe is enabled in production:**

1. On the COVENANT result page, click **Purchase [Package Name]**.
2. You'll be redirected to Stripe Checkout.
3. After paying, you return to `/packages/success`.
4. The purchase is automatically recorded via the Stripe webhook. The `purchases` table flips to `paid`.

Until Stripe is configured, the button shows "Coming soon" — see [Enabling Stripe](#enabling-stripe).

---

## 3. Intelligence Suite — content generators

**When:** you need to produce a social post, handle an objection, or prep for a prospect meeting.

Click **Intelligence Suite** in the sidebar. Three tabs:

### Social Post

1. Pick a **topic** — what the post is about.
2. Choose a **platform** — LinkedIn (150–250 words), Twitter (under 280 chars), Instagram (100–180 words).
3. Optional: override the **tone**.
4. Click **Generate**. The post appears below, with a one-click **Copy** button.
5. It's auto-saved to your library. Recent posts of this type appear underneath.

### Objection Response

1. Paste the prospect's **objection** verbatim.
2. Optional: add **context** (discovery call, which package, funnel stage).
3. Click **Generate response**.

The output follows a four-beat pattern: acknowledge → diagnose → reframe → close with a specific next step.

### Prospect Intel

1. Enter the **prospect name**.
2. Optional: company, known facts (bio, intro context), source.
3. Click **Generate brief**.

You get a four-section brief: who they likely are, probable pain points, lead-in angle, unknowns to ask about. Designed for prep right before a call.

**Voice consistency:** all three generators use a shared "Perry Hampton" voice baseline — direct, first-person, diagnostic, no emojis. That's applied automatically on every generation.

---

## 4. Deal workspace — acquisitions and UCC structuring

### Command Dashboard

The kanban board shows your deal pipeline across 5 phases:

| Phase | Focus |
|---|---|
| **P1 Identify** | Target discovered, preliminary read |
| **P2 Diligence** | Financials, legal, operational review |
| **P3 Structure** | Capital stack, UCC strategy, contracts |
| **P4 Close** | Final docs, funding, transaction |
| **P5 Operate** | Post-close operation and integration |

At the top you see three stats: **active deals**, **total deals**, **pipeline value** (sum of estimated values).

**To add a deal:** click **New deal** → fill name, target entity, estimated value, starting phase, and notes → **Create deal**. You land on the deal detail page.

**To view a deal:** click any card in the kanban.

**Dead deals** are hidden from the kanban by default. They're still in the database.

### Deal detail page

This is where most deal work happens. It has five sections:

#### 1. Header with phase + status
- Deal name, target entity
- Phase badge (P1–P5) and status badge (Active / Paused / Closed / Dead)
- **Edit** button in top-right

#### 2. Phase & status controls
- Click any phase button to move the deal (logs an event)
- Click any status button to change state

#### 3. Overview
- Click **Edit** to update name, target entity, estimated value, or notes
- Shows pipeline capital raised (sum of capital stack items)

#### 4. OOCEMR analysis

**When:** any time you want a structured read on a deal's opportunity, risks, and red flags.

1. Click **Run analysis** (or **Re-run analysis** if one exists).
2. Claude Opus 4.7 reads the deal, capital stack, and UCC filings. Takes 15–30 seconds.
3. You get a six-field analysis:
   - **Opportunity** — what the deal is, why it exists
   - **Ownership** — entity structure, control
   - **Collateral** — what secures positions
   - **Encumbrances** — existing liens, priority
   - **Margin** — equity, cash flow, returns
   - **Risk** — legal, market, counterparty, execution
4. Plus a **confidence score** (data coverage 0–100) and **red flags** (concrete issues in the data).

**Re-run any time the underlying data changes** — more complete capital stack or additional notes will produce a sharper analysis.

#### 5. Capital stack editor

**When:** recording how the deal is financed.

1. Click **+ Add item**.
2. Pick a **tier** — Senior debt / Mezzanine / UCC-secured / Seller financing / Equity.
3. Enter the **source** (lender / party name), **amount**, and optional **rate** and **term in months**.
4. **Add to stack**.
5. The total and item count update at the top of the section.

Items show as a stacked list with colored tier badges. Delete any item with the **✕** on the right.

#### 6. UCC filings

**When:** recording any UCC-1 Financing Statement for the deal.

**Adding a filing:**
1. Click **+ New filing**.
2. Enter the **filing state** (2-letter), **debtor**, **secured party**, and optional **collateral description**.
3. **Create draft**. Filing is saved at status "Draft."

**Status workflow:**
- **Draft** → click **Mark as filed…** → enter the real filing number from the Secretary of State → **Confirm**. Status becomes **Filed** with a filing date.
- **Filed** → **Mark amended** or **Terminate** (for when the obligation is satisfied).
- **Amended** → **Terminate**.

**Printing / exporting as PDF:**
1. Click **Print / Export PDF ↗** on any filing.
2. A clean UCC-1–style document opens in a new tab — white background, numbered boxes, legal disclaimer.
3. Click **Print / Save as PDF** in the top bar.
4. Use your browser's print dialog → destination **Save as PDF** (or print to paper).

> ⚠️ **Important:** The PDF is a **draft for internal review**. Actual UCC-1 filings must be submitted to the appropriate Secretary of State through their official channel. Consult counsel.

### UCC Wealth Engine

**When:** you want a cross-deal view of every UCC filing.

Click **UCC Wealth Engine** in the sidebar. You see:
- **Stat row:** total filings, and count per status (Draft / Filed / Amended / Terminated)
- **Filters:** filter by status and/or by state (e.g., only TX filings)
- **Table:** every filing with debtor, deal name, filing number, and a link to the owning deal

Useful for answering questions like "how many active UCC positions do we have in Texas?" or "which deals still have draft filings I haven't submitted?"

---

## 5. Partner Network — IUL advisors, legal, CPAs

### Finding a partner

Click **IUL Partners** in the sidebar. You see:
- **Search box** — name, company, or email
- **Type filter** — IUL Advisor / Legal / CPA / Broker / Other
- **Status filter** — Pending / In review / Approved / Rejected
- **Table** of matching partners

Filters are URL-driven — bookmark a specific filter combination if you run it often (e.g., "approved IUL advisors in TX").

### Adding a partner

1. Click **Add partner**.
2. Fill in: full name, company, type, email, phone, license number, license state.
3. Set initial **vetting status** (default: Pending).
4. Optional vetting notes.
5. **Create partner**. You land on the detail page.

### Vetting workflow

On any partner detail page:

1. Click a status button in the **Vetting** section to advance/change state:
   - Pending → In review (when you start checking references)
   - In review → Approved or Rejected (when vetting completes)
2. Each status change is logged to the events feed.
3. **Edit** any other field with the edit button at the top.
4. **Delete** via the red "Delete partner" link in the vetting section (requires confirmation).

Best practice: always fill in **vetting notes** when changing status. It's the paper trail.

---

## 6. Library — reference knowledge

Two static reference articles, readable by any authed user:

### Kingdom Strategy
The three-intelligence operating framework — Spiritual, Human, Applied. The philosophical foundation for how BPIS thinks about entrepreneurship.

### IUL Framework
Partner vetting criteria and member education pillars for Indexed Universal Life advisors.

Both are stored in the database as markdown, so they can be updated without a code deploy if needed (currently: edit `knowledge_articles` table in Supabase directly).

---

## 7. Analytics

Click **Analytics** in the sidebar. Four sections:

### Headline stats
- Active deals
- Pipeline value
- Approved partners
- Content generated this week

### Funnel
A 3-step view: ORACLE assessments → COVENANT assessments → Paid purchases. Tells you where prospects drop off.

### Tier & package mix
- ORACLE readiness distribution (Foundation / Activation / Mastery)
- COVENANT package distribution (Essential / Builder / Sovereign)

### Deal phase distribution
Horizontal bars showing how many deals sit in each phase. Good for spotting bottlenecks — if P2 is piling up, diligence is the constraint.

### Recent activity
Live feed of the last 25 events across the system — deals created, phases changed, assessments analyzed, partners vetted, purchases completed. Timestamped per event.

---

## 8. Admin tasks

These are done outside the app (via scripts or Supabase dashboard). They require the secret Supabase key.

### Adding a new operator

1. Add their email to the `ALLOWED_OPERATOR_EMAILS` env var in Vercel (comma-separated).
2. Redeploy so the change takes effect.
3. They sign in with the magic link flow. Their default role is `founder`.
4. To promote them to `operator`, run:
   ```bash
   npm run promote -- their@email.com
   ```
   (Or update their row in `public.users` directly in the Supabase SQL editor: `update public.users set role = 'operator' where email = '...';`)

### Removing mock data

All seed data is tagged `is_mock = true`. To wipe it all:
```bash
npm run seed:clear
```
**This is blocked in production** (`APP_ENV=prod`). In dev/staging it's safe to run anytime.

### Re-seeding mock data

```bash
npm run seed
```
Idempotent for reference data (packages, knowledge articles). Creates new mock users/partners/deals/assessments each run — only run against an empty-mock database.

### Viewing the raw event log

All state changes write to the `events` table. Query it in the Supabase SQL editor:
```sql
select event_type, entity_type, occurred_at, payload
from events
order by occurred_at desc
limit 100;
```

---

## 9. Enabling Stripe

The purchase flow is wired but dormant. To turn it on:

1. Create Essential, Builder, and Sovereign **products + prices** in live Stripe.
2. Copy each `price_id` → paste into `public.packages.stripe_price_id` in Supabase (one per row).
3. Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel env vars.
4. Register the webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
5. Redeploy.
6. Smoke test: run through a COVENANT assessment → click Purchase → complete a $1 test → verify `purchases` row flips to `paid`.

Full details in [`docs/GO-LIVE.md`](GO-LIVE.md) section 6.

---

## 10. For clients

*(If you're a client who was invited, start here. Skip everything above.)*

1. You'll receive an email with a sign-in link.
2. Click it to enter your account.
3. You'll see a reduced sidebar showing what's available to you.
4. Your operator will typically walk you through running an ORACLE or COVENANT assessment.
5. You can always run more assessments on your own once you're logged in.

Your data is private. Only you and the operators assigned to your account can see it.

---

## 11. Troubleshooting

### "The magic link doesn't work"
- Check it's less than 5 minutes old. Older links are invalid.
- Make sure you're opening it in the same browser where you started sign-in.
- Request a new one.

### "I'm on the allow-list but still getting rejected"
- Check the email matches exactly (no stray whitespace, correct capitalization).
- Confirm the env var was saved in Vercel **and a redeploy happened** after the change.

### "ORACLE/COVENANT failed"
- The assessment was still saved (you can find it in the list view). It's marked "submitted" instead of "analyzed."
- Usually caused by Anthropic API timeout. Retry by running a new assessment. The old failed one can be deleted later.

### "OOCEMR returned low confidence"
- Below 60 means the deal has thin data. Add more to the capital stack, flesh out the notes, create UCC filing drafts — then re-run.

### "Nothing is showing up in IUL Partners"
- Check the Type and Status filter chips at the top. If any are set, only matching partners show. Click **All** on both rows to reset.

### "The 'Purchase' button says coming soon"
- Expected until Stripe is enabled. See [Enabling Stripe](#enabling-stripe).

### "Something crashed"
- Screenshot the error and check the Vercel function logs (Vercel → Project → Logs). The error message will usually point at the problem — missing env var, DB row not found, API timeout.

---

## 12. Quick reference — which tool for which job?

| I need to… | Go to |
|---|---|
| See what's in the pipeline | Command Dashboard |
| Assess a new prospect | ORACLE |
| Recommend a legal package | COVENANT |
| Write a LinkedIn post | Intelligence Suite → Social Post |
| Respond to a prospect objection | Intelligence Suite → Objection |
| Prep for a first call | Intelligence Suite → Prospect Intel |
| Add a new deal | Command Dashboard → New deal |
| Record a loan or equity on a deal | Deal detail → Capital stack |
| Draft a UCC-1 | Deal detail → UCC filings |
| Print a UCC-1 draft for counsel review | UCC filing → Print / Export PDF |
| Get a structured read on a deal | Deal detail → OOCEMR → Run analysis |
| Find an IUL advisor in Texas | IUL Partners → filter Type: IUL Advisor → search "TX" |
| Vet a new advisor | IUL Partners → Add partner → walk through statuses |
| Look at pipeline health | Analytics |
| Read the philosophy | Library → Kingdom Strategy |
| Reference the IUL vetting framework | Library → IUL Framework |

---

*Last updated with the initial v1 build. When features change, update this guide to match.*
