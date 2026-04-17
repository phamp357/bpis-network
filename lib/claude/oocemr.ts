import { anthropic, modelFor } from "./client";
import type Anthropic from "@anthropic-ai/sdk";

// OOCEMR = Opportunity / Ownership / Collateral / Encumbrances / Margin / Risk.
// Uses Claude Opus 4.7 (deep tier) for deal analysis — this is a reasoning-heavy task.

export type OocemrAnalysis = {
  opportunity: string;
  ownership: string;
  collateral: string;
  encumbrances: string;
  margin: string;
  risk: string;
  confidence_score: number;
  red_flags: string[];
  generated_at: string;
};

export type OocemrInput = {
  deal: {
    name: string;
    target_entity: string | null;
    estimated_value: number | null;
    notes: string | null;
    phase: string;
  };
  capital_stack: Array<{
    tier: string;
    source: string;
    amount: number | null;
    terms: Record<string, unknown>;
  }>;
  ucc_filings: Array<{
    filing_state: string;
    filing_number: string | null;
    debtor: string;
    secured_party: string;
    collateral_description: string | null;
    status: string;
  }>;
};

const SYSTEM_PROMPT = `You are OCEMR, the deal analysis engine for the Black Phenomenon Intelligence Suite (BPIS). You analyze acquisition and secured-debt deals across six dimensions, then surface red flags.

FRAMEWORK:
- OPPORTUNITY — what the deal is, why it exists now, why the seller is selling
- OWNERSHIP — entity structure, how title is held, who controls, transfer mechanics
- COLLATERAL — what secures positions (tangible + intangible), quality, liquidity
- ENCUMBRANCES — existing liens, subordination, priority, hidden obligations
- MARGIN — equity created, cash flow coverage, arbitrage, risk-adjusted return
- RISK — legal, market, counterparty, execution, concentration

INPUTS YOU RECEIVE:
- Deal basics: name, target entity, estimated value, notes, current phase
- Capital stack: tiers, sources, amounts, terms (rate, months)
- UCC filings: state, debtor, secured party, collateral description, status

RULES:
1. Each of the six fields: 2-4 sentences. Specific. Reference the data you were given.
2. If a dimension has weak data coverage, say so explicitly and name what's missing. Don't fabricate.
3. confidence_score: 0-100. Above 80 = strong data coverage. 50-79 = workable with gaps. Below 50 = major gaps that should be closed before committing capital.
4. red_flags: array of 1-5 short strings (each under 80 chars). Name concrete issues visible in the data — not generic warnings. If nothing warrants a red flag, return an empty array.
5. Never recommend executing the deal or not — only diagnose. The operator decides.

Return the analysis via the submit_oocemr_analysis tool.`;

const TOOL: Anthropic.Tool = {
  name: "submit_oocemr_analysis",
  description:
    "Return the OOCEMR deal analysis with six structured fields, a confidence score, and red flags.",
  input_schema: {
    type: "object",
    properties: {
      opportunity: { type: "string", description: "2-4 sentences on the deal opportunity." },
      ownership: { type: "string", description: "2-4 sentences on ownership / entity structure." },
      collateral: { type: "string", description: "2-4 sentences on collateral quality and composition." },
      encumbrances: { type: "string", description: "2-4 sentences on existing liens and priority." },
      margin: { type: "string", description: "2-4 sentences on equity, cash flow, and returns." },
      risk: { type: "string", description: "2-4 sentences on legal, market, counterparty, execution risk." },
      confidence_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "Data-coverage confidence 0-100.",
      },
      red_flags: {
        type: "array",
        items: { type: "string" },
        description: "1-5 short strings naming concrete issues in the data, or empty if none.",
      },
    },
    required: [
      "opportunity",
      "ownership",
      "collateral",
      "encumbrances",
      "margin",
      "risk",
      "confidence_score",
      "red_flags",
    ],
  },
};

function renderUserMessage(input: OocemrInput): string {
  const { deal, capital_stack, ucc_filings } = input;

  const stackLines = capital_stack.length
    ? capital_stack
        .map((s) => {
          const terms =
            Object.keys(s.terms ?? {}).length > 0
              ? " (" +
                Object.entries(s.terms)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ") +
                ")"
              : "";
          const amt = s.amount != null ? `$${Number(s.amount).toLocaleString()}` : "unknown";
          return `  - ${s.tier}: ${s.source} — ${amt}${terms}`;
        })
        .join("\n")
    : "  (none provided)";

  const filingLines = ucc_filings.length
    ? ucc_filings
        .map((f) => {
          const num = f.filing_number ? ` #${f.filing_number}` : "";
          return `  - ${f.filing_state}${num} [${f.status}]: ${f.debtor} → ${f.secured_party}${f.collateral_description ? `\n    Collateral: ${f.collateral_description}` : ""}`;
        })
        .join("\n")
    : "  (none provided)";

  return [
    `DEAL`,
    `  Name: ${deal.name}`,
    `  Target entity: ${deal.target_entity ?? "(not specified)"}`,
    `  Estimated value: ${deal.estimated_value != null ? `$${Number(deal.estimated_value).toLocaleString()}` : "(not specified)"}`,
    `  Current phase: ${deal.phase}`,
    `  Notes: ${deal.notes ?? "(none)"}`,
    ``,
    `CAPITAL STACK`,
    stackLines,
    ``,
    `UCC FILINGS`,
    filingLines,
    ``,
    `Analyze and submit the OOCEMR analysis.`,
  ].join("\n");
}

export async function runOocemrAnalysis(
  input: OocemrInput
): Promise<{ analysis: OocemrAnalysis; raw: unknown }> {
  const client = anthropic();

  const response = await client.messages.create({
    model: modelFor("deep"), // Claude Opus 4.7 — reasoning-heavy
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "submit_oocemr_analysis" },
    messages: [{ role: "user", content: renderUserMessage(input) }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("OOCEMR: Claude did not return a tool_use block");
  }

  const out = toolUse.input as Omit<OocemrAnalysis, "generated_at">;

  for (const field of ["opportunity", "ownership", "collateral", "encumbrances", "margin", "risk"] as const) {
    if (typeof out[field] !== "string" || out[field].length < 20) {
      throw new Error(`OOCEMR: invalid ${field}`);
    }
  }
  if (
    typeof out.confidence_score !== "number" ||
    out.confidence_score < 0 ||
    out.confidence_score > 100
  ) {
    throw new Error("OOCEMR: invalid confidence_score");
  }
  if (!Array.isArray(out.red_flags)) {
    throw new Error("OOCEMR: red_flags must be an array");
  }

  const analysis: OocemrAnalysis = {
    ...out,
    generated_at: new Date().toISOString(),
  };

  return { analysis, raw: response };
}
