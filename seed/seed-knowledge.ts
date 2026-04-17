import { adminClient, log } from "./_common";

export async function seedKnowledge() {
  const db = adminClient();
  const rows = [
    {
      slug: "kingdom-strategy-overview",
      title: "The Black Phenomenon: Kingdom Strategy",
      category: "kingdom-strategy",
      body_md: `# The Black Phenomenon: Kingdom Strategy

An integrated framework combining three intelligences:

- **Spiritual Intelligence** — rooted in Kingdom principles, covenant, and purpose.
- **Human Intelligence** — discipline, emotional mastery, and relational capital.
- **Applied Intelligence** — strategy, systems, and execution.

Legacy is built where all three converge.`,
      published: true,
      is_mock: true,
    },
    {
      slug: "iul-framework-overview",
      title: "IUL Partner & Education Framework",
      category: "iul",
      body_md: `# IUL Partner & Education Framework

How we vet Indexed Universal Life advisors and educate members.

## Vetting criteria
- Active, unrestricted state license
- Minimum 5 years in IUL structuring
- Clean compliance record
- Alignment with Kingdom stewardship principles

## Education pillars
- Tax-advantaged growth mechanics
- Living benefits vs death benefit
- Cash value access and loan strategies
- Policy structuring for legacy transfer`,
      published: true,
      is_mock: true,
    },
    {
      slug: "oocemr-framework",
      title: "OOCEMR — Secured Debt Acquisition Framework",
      category: "ucc",
      body_md: `# OOCEMR Framework

A six-step lens for evaluating secured-debt acquisition opportunities.

1. **O**pportunity — what is the asset and why does it exist?
2. **O**wnership — who controls it and how is title held?
3. **C**ollateral — what secures the position?
4. **E**ncumbrances — existing liens, subordination, priority.
5. **M**argin — equity, arbitrage, and risk-adjusted return.
6. **R**isk — legal, market, counterparty, execution.

Used by the UCC Wealth Engine to structure deals.`,
      published: true,
      is_mock: true,
    },
  ];

  const { error } = await db
    .from("knowledge_articles")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: false });
  if (error) throw error;
  log("knowledge", `upserted ${rows.length} articles`);
}
