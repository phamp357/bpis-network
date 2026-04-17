import { anthropic, modelFor } from "./client";
import type Anthropic from "@anthropic-ai/sdk";

// 6 questions — tighter than ORACLE since we're classifying into 3 packages.
export const COVENANT_QUESTIONS = [
  {
    key: "stage" as const,
    label: "Business stage",
    helper: "Where is the business today?",
    type: "radio" as const,
    options: [
      { value: "idea", label: "Idea — not yet formed, still validating" },
      { value: "pre_revenue", label: "Pre-revenue — formed, not earning yet" },
      { value: "early", label: "Early — $0–$150K/year" },
      { value: "growth", label: "Growth — $150K–$1M/year" },
      { value: "scale", label: "Scale — $1M–$5M/year" },
      { value: "mature", label: "Mature — $5M+/year" },
    ],
  },
  {
    key: "team_size" as const,
    label: "Team size",
    helper: "Full-time employees plus regular contractors combined.",
    type: "number" as const,
    min: 1,
  },
  {
    key: "state_of_formation" as const,
    label: "State of formation",
    helper: "Where is the entity formed (or will be)? e.g., TX, DE, FL.",
    type: "text" as const,
    maxLength: 2,
    placeholder: "TX",
  },
  {
    key: "legal_foundation" as const,
    label: "Current legal foundation",
    helper: "What's already in place?",
    type: "radio" as const,
    options: [
      { value: "none", label: "None — not yet incorporated" },
      { value: "diy", label: "DIY — LegalZoom, ZenBusiness, or similar" },
      { value: "professional", label: "Professional — formed with a lawyer" },
      { value: "restructuring", label: "Restructuring — need to change structure" },
    ],
  },
  {
    key: "funding_goal" as const,
    label: "Funding goal (next 12 months)",
    helper: "How much capital do you plan to raise, borrow, or reinvest?",
    type: "radio" as const,
    options: [
      { value: "bootstrap", label: "Bootstrap — no outside capital" },
      { value: "under_100k", label: "Under $100K" },
      { value: "100k_500k", label: "$100K–$500K" },
      { value: "500k_2m", label: "$500K–$2M" },
      { value: "over_2m", label: "Over $2M" },
    ],
  },
  {
    key: "primary_concern" as const,
    label: "Primary legal concern",
    helper: "What legal gap, risk, or headache worries you most right now?",
    type: "textarea" as const,
  },
] as const;

export type CovenantResponseKey = (typeof COVENANT_QUESTIONS)[number]["key"];
export type CovenantResponses = Record<CovenantResponseKey, string>;

export type CovenantPackageCode = "essential" | "builder" | "sovereign";

export type CovenantAnalysis = {
  recommended_package_code: CovenantPackageCode;
  score: number;
  strategy_notes: string;
};

const SYSTEM_PROMPT = `You are COVENANT, the Legal Foundation Agent for the Black Phenomenon Intelligence Suite (BPIS). You classify Kingdom-centered founders into one of three legal packages based on their stage, team, capital, and concerns.

PACKAGES:

1) essential — $1,497
   Fit: idea / pre-revenue / early-stage founders. Solo or 1-2 people. Bootstrap or under $100K funding. Needs foundational protection: LLC formation, operating agreement, EIN, basic compliance checklist.

2) builder — $4,997
   Fit: growth-stage businesses ($150K–$1M). Team of 2-10. Past formation but scaling operations. Needs: contract templates, IP/NDA, contractor vs employee framework, quarterly compliance review, plus everything in Essential.

3) sovereign — $14,997
   Fit: scale / mature businesses ($1M+). Larger teams. Raising $500K+ or planning acquisitions. Needs: UCC-1 strategy, revocable living trust, asset protection structure, dedicated legal strategist, plus everything in Builder.

CLASSIFICATION LOGIC:
- Default to the smallest package that covers the founder's situation. Don't over-prescribe.
- Stage is the primary signal. Team size and funding goal break ties.
- If the primary concern explicitly mentions asset protection, multi-entity, UCC, trusts, or acquisitions → sovereign, even if stage would suggest smaller.
- If the primary concern is formation-only (LLC setup, operating agreement) and stage is pre-revenue → essential.
- If legal_foundation is 'restructuring' and stage is growth+ → builder minimum, consider sovereign.

SCORE:
Your confidence 0-100 that this is the right package. Above 80 = clear fit. 60-79 = good fit with some ambiguity. Below 60 = judgment call — explain the ambiguity in notes.

STRATEGY NOTES:
3-5 sentences. Name the specific reason for the recommendation (cite their own words). Flag what Essential/Builder/Sovereign specifically covers for THEIR concern. If there's ambiguity, name what would push them to the next tier.

Use the submit_package_recommendation tool.`;

const TOOL: Anthropic.Tool = {
  name: "submit_package_recommendation",
  description:
    "Return the COVENANT package recommendation with confidence score and founder-specific strategy notes.",
  input_schema: {
    type: "object",
    properties: {
      recommended_package_code: {
        type: "string",
        enum: ["essential", "builder", "sovereign"],
        description: "Which package fits this founder.",
      },
      score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "Confidence 0-100 that this is the right package.",
      },
      strategy_notes: {
        type: "string",
        description: "3-5 sentences citing the founder's specific situation and words.",
      },
    },
    required: ["recommended_package_code", "score", "strategy_notes"],
  },
};

function renderUserMessage(responses: CovenantResponses): string {
  return [
    "Founder intake:",
    "",
    ...COVENANT_QUESTIONS.map(
      (q, i) =>
        `Q${i + 1} — ${q.label}:\n${responses[q.key]?.toString().trim() || "(blank)"}`
    ),
    "",
    "Recommend the package and submit.",
  ].join("\n\n");
}

export async function runCovenantAnalysis(
  responses: CovenantResponses
): Promise<{ analysis: CovenantAnalysis; raw: unknown }> {
  const client = anthropic();

  const response = await client.messages.create({
    model: modelFor("fast"),
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "submit_package_recommendation" },
    messages: [{ role: "user", content: renderUserMessage(responses) }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("COVENANT: Claude did not return a tool_use block");
  }

  const input = toolUse.input as CovenantAnalysis;

  if (
    !["essential", "builder", "sovereign"].includes(input.recommended_package_code) ||
    typeof input.score !== "number" ||
    input.score < 0 ||
    input.score > 100 ||
    typeof input.strategy_notes !== "string" ||
    input.strategy_notes.length < 20
  ) {
    throw new Error("COVENANT: invalid tool output — " + JSON.stringify(input));
  }

  return { analysis: input, raw: response };
}
