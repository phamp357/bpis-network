import { anthropic, modelFor } from "./client";
import type Anthropic from "@anthropic-ai/sdk";

// The 7 questions — single source of truth used by the form AND the prompt.
export const ORACLE_QUESTIONS = [
  {
    key: "q1_current_revenue" as const,
    label: "Current revenue stage",
    helper: "Where is the business right now?",
    type: "radio" as const,
    options: [
      { value: "pre_revenue", label: "Pre-revenue — not yet earning" },
      { value: "early", label: "Early — $0 to $150K/year" },
      { value: "growth", label: "Growth — $150K to $500K/year" },
      { value: "scale", label: "Scale — $500K to $2M/year" },
      { value: "mature", label: "Mature — $2M+/year" },
    ],
  },
  {
    key: "q2_primary_bottleneck" as const,
    label: "Primary bottleneck",
    helper: "What is the single biggest thing holding the business back right now?",
    type: "textarea" as const,
  },
  {
    key: "q3_team_structure" as const,
    label: "Team structure",
    helper: "Describe the current team — full-time, contractors, partners, etc.",
    type: "textarea" as const,
  },
  {
    key: "q4_spiritual_alignment" as const,
    label: "Spiritual alignment & practice",
    helper: "How consistent is your spiritual practice? What does a typical week look like?",
    type: "textarea" as const,
  },
  {
    key: "q5_goal_horizon_12mo" as const,
    label: "12-month goal",
    helper: "What outcome, 12 months from now, would make this year feel like a clear win?",
    type: "textarea" as const,
  },
  {
    key: "q6_biggest_fear" as const,
    label: "Biggest risk or blocker",
    helper: "What failure mode keeps you up at night? What's the risk you fear most?",
    type: "textarea" as const,
  },
  {
    key: "q7_ideal_outcome" as const,
    label: "Ideal 2-year outcome",
    helper: "If BPIS delivers for you, what does your life look like 2 years from now?",
    type: "textarea" as const,
  },
] as const;

export type OracleResponseKey = (typeof ORACLE_QUESTIONS)[number]["key"];
export type OracleResponses = Record<OracleResponseKey, string>;

export type OracleAnalysis = {
  score: number;
  tier: "foundation" | "activation" | "mastery";
  strategy_notes: string;
};

const SYSTEM_PROMPT = `You are ORACLE, the Client Activation Profile Generator for the Black Phenomenon Intelligence Suite (BPIS). You assess Kingdom-centered entrepreneurs across three dimensions — spiritual intelligence, human intelligence, and applied intelligence — and produce a readiness classification.

READINESS TIERS:
- foundation: The operator needs to build discipline, clarity, or core business fundamentals before scaling. Recommend this for founders who are pre-revenue, inconsistent in practice, or unclear on their 12-month target. Score range: 0-49.
- activation: The operator has baseline fundamentals but needs systems, team, and reinvestment to scale. Recommend this for founders in the $150K-$2M range with a clear direction but operational gaps. Score range: 50-79.
- mastery: The operator has strong fundamentals, systems, and alignment. Recommendations focus on legacy, acquisition, and capital structuring. Score range: 80-100.

SCORING RUBRIC (weigh roughly equally):
1. Revenue momentum
2. Operational capacity (team, systems)
3. Spiritual alignment and discipline
4. Clarity of 12-month target
5. Self-awareness about risks and failure modes
6. Ambition and vision (2-year outcome)

OUTPUT REQUIREMENTS:
Use the submit_activation_assessment tool. Your strategy_notes field should:
- Be 3-5 sentences.
- Name the specific next move, not vague advice.
- Reflect Kingdom-centered language where natural — not forced.
- Reference the founder's own words when citing a specific strength or gap.`;

const TOOL: Anthropic.Tool = {
  name: "submit_activation_assessment",
  description:
    "Return the ORACLE activation assessment: a numeric readiness score, a tier classification, and strategy notes.",
  input_schema: {
    type: "object",
    properties: {
      score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description: "Readiness score 0-100. foundation=0-49, activation=50-79, mastery=80-100.",
      },
      tier: {
        type: "string",
        enum: ["foundation", "activation", "mastery"],
        description: "Readiness tier — must align with score range.",
      },
      strategy_notes: {
        type: "string",
        description: "3-5 sentences. Specific next move. Reference the founder's own words.",
      },
    },
    required: ["score", "tier", "strategy_notes"],
  },
};

function renderUserMessage(responses: OracleResponses): string {
  return [
    "Responses from the activation intake:",
    "",
    ...ORACLE_QUESTIONS.map(
      (q, i) => `Q${i + 1} — ${q.label}:\n${responses[q.key]?.trim() || "(blank)"}`
    ),
    "",
    "Analyze and submit the assessment.",
  ].join("\n\n");
}

export async function runOracleAnalysis(
  responses: OracleResponses
): Promise<{ analysis: OracleAnalysis; raw: unknown }> {
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
    tool_choice: { type: "tool", name: "submit_activation_assessment" },
    messages: [{ role: "user", content: renderUserMessage(responses) }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("ORACLE: Claude did not return a tool_use block");
  }

  const input = toolUse.input as OracleAnalysis;

  if (
    typeof input.score !== "number" ||
    input.score < 0 ||
    input.score > 100 ||
    !["foundation", "activation", "mastery"].includes(input.tier) ||
    typeof input.strategy_notes !== "string" ||
    input.strategy_notes.length < 20
  ) {
    throw new Error("ORACLE: invalid tool output — " + JSON.stringify(input));
  }

  return { analysis: input, raw: response };
}
