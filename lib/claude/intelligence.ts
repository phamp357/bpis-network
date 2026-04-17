import { anthropic, modelFor } from "./client";

// Intelligence Suite — three content generators, shared Kingdom voice baseline.
// Each returns plain text (no tool_use needed for creative content).

export type GeneratorType = "social_post" | "objection_response" | "prospect_intel";

const VOICE_BASELINE = `You write in the voice of Perry Hampton, founder of the Black Phenomenon.
Direct. First-person. Diagnostic before prescriptive. Kingdom-centered when natural — never forced or performative.
No emojis. No corporate hype. Short sentences when they earn their keep.
Reference the reader's specific situation before offering any framework.`;

// === Social Post ===

const SOCIAL_SYSTEM = `${VOICE_BASELINE}

You generate social media posts for Kingdom-centered entrepreneurs.

PLATFORM RULES:
- linkedin: 150-250 words. One clear insight. Line breaks for readability. No hashtags.
- twitter: Under 280 characters. One sharp observation or question. No hashtags.
- instagram: 100-180 words. Caption style. Mild hook. No hashtags — the user will add their own.

OUTPUT: Only the post itself. No preamble, no sign-off, no "Here's your post:" framing.`;

// === Objection Response ===

const OBJECTION_SYSTEM = `${VOICE_BASELINE}

You write responses to sales/prospect objections for a Kingdom-centered entrepreneur selling BPIS services (legal packages, wealth engineering, NIL ambassador programs, content suite).

PATTERN:
1. Acknowledge (one sentence — don't validate the objection as correct, just acknowledge you heard it).
2. Diagnose (one or two clarifying questions — what's the real concern underneath).
3. Reframe (one sentence anchored in the prospect's stated goal or fear).
4. Close (a specific next step — not "let me know", but "I'll send X" or "what about a 15-min call Thursday").

Keep it under 120 words. No hard-sell. No emojis.

OUTPUT: Only the response itself.`;

// === Prospect Intel ===

const PROSPECT_SYSTEM = `${VOICE_BASELINE}

You generate a 1-page prospect intelligence brief for a Kingdom entrepreneur preparing for a first conversation with a potential client, partner, or ambassador.

STRUCTURE (use these exact section headings in plain text, not markdown):

WHO THEY LIKELY ARE
2-3 sentences synthesizing the facts provided. Be honest about assumptions — say "likely" or "probably" when inferring.

PROBABLE PAIN POINTS
3 bullet points. Most specific first. Ground each in their stage/context, not generic pain.

LEAD-IN ANGLE
1-2 sentences. A specific opening observation or question — not "I noticed you...". Something only a thoughtful reader of their situation would say.

UNKNOWNS TO ASK ABOUT
3 bullet points. Things we don't know that would meaningfully change the approach.

OUTPUT: Only the brief. No preamble.`;

// === Runners ===

async function runGeneration({
  system,
  userPrompt,
  maxTokens,
}: {
  system: string;
  userPrompt: string;
  maxTokens: number;
}): Promise<{ output: string; raw: unknown }> {
  const client = anthropic();
  const response = await client.messages.create({
    model: modelFor("fast"),
    max_tokens: maxTokens,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Intelligence: Claude did not return text output");
  }
  const output = textBlock.text.trim();
  if (output.length < 10) {
    throw new Error("Intelligence: output too short");
  }
  return { output, raw: response };
}

// === Generator: Social Post ===

export type SocialPostInput = {
  topic: string;
  platform: "linkedin" | "twitter" | "instagram";
  tone?: string;
};

export async function generateSocialPost(input: SocialPostInput) {
  const userPrompt = [
    `Platform: ${input.platform}`,
    input.tone ? `Tone override: ${input.tone}` : null,
    "",
    "Topic:",
    input.topic,
  ]
    .filter(Boolean)
    .join("\n");

  return runGeneration({
    system: SOCIAL_SYSTEM,
    userPrompt,
    maxTokens: 600,
  });
}

// === Generator: Objection Response ===

export type ObjectionInput = {
  objection: string;
  context?: string;
};

export async function generateObjectionResponse(input: ObjectionInput) {
  const userPrompt = [
    "Prospect said:",
    input.objection,
    "",
    input.context ? `Context: ${input.context}` : null,
    "",
    "Write the response.",
  ]
    .filter(Boolean)
    .join("\n");

  return runGeneration({
    system: OBJECTION_SYSTEM,
    userPrompt,
    maxTokens: 400,
  });
}

// === Generator: Prospect Intel ===

export type ProspectInput = {
  prospect_name: string;
  company?: string;
  known_facts?: string;
  source?: string;
};

export async function generateProspectIntel(input: ProspectInput) {
  const userPrompt = [
    `Prospect name: ${input.prospect_name}`,
    input.company ? `Company: ${input.company}` : null,
    input.source ? `Source: ${input.source}` : null,
    input.known_facts ? `Known facts:\n${input.known_facts}` : null,
    "",
    "Generate the brief.",
  ]
    .filter(Boolean)
    .join("\n");

  return runGeneration({
    system: PROSPECT_SYSTEM,
    userPrompt,
    maxTokens: 800,
  });
}

// === Label helpers ===

export const GENERATOR_LABELS: Record<GeneratorType, { name: string; description: string }> = {
  social_post: {
    name: "Social Post",
    description: "LinkedIn, Twitter, or Instagram caption — written in your voice.",
  },
  objection_response: {
    name: "Objection Response",
    description: "Diagnose and reframe a prospect objection with a specific next step.",
  },
  prospect_intel: {
    name: "Prospect Intel",
    description: "One-page brief: who they likely are, pain points, lead-in angle.",
  },
};
