import Anthropic from "@anthropic-ai/sdk";

// Model routing per agent family.
// Sonnet 4.6 for fast, high-volume agents (COVENANT, ORACLE, content, intake).
// Opus 4.7 for deep reasoning (UCC Wealth Engine, deal analysis, OOCEMR).
export const MODELS = {
  fast: "claude-sonnet-4-6",
  deep: "claude-opus-4-7",
} as const;

export type ModelTier = keyof typeof MODELS;

let _client: Anthropic | null = null;

export function anthropic() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

export function modelFor(tier: ModelTier) {
  return MODELS[tier];
}
