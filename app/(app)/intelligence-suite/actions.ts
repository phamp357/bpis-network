"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateSocialPost,
  generateObjectionResponse,
  generateProspectIntel,
  type GeneratorType,
} from "@/lib/claude/intelligence";

type GenResult = { id: string; output: string };

async function persist(
  type: GeneratorType,
  userId: string,
  prompt: string,
  output: string,
  brandVoiceSnapshot: Record<string, unknown>
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_assets")
    .insert({
      user_id: userId,
      asset_type: type,
      prompt,
      output,
      brand_voice_snapshot: brandVoiceSnapshot as never,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to save asset");

  await supabase.from("events").insert({
    user_id: userId,
    event_type: "intelligence.generated",
    entity_type: "content_assets",
    entity_id: data.id,
    payload: { type },
  });

  return data.id;
}

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function runSocialPostAction(formData: FormData): Promise<GenResult> {
  const user = await currentUser();
  const topic = String(formData.get("topic") ?? "").trim();
  const platform = String(formData.get("platform") ?? "linkedin") as
    | "linkedin"
    | "twitter"
    | "instagram";
  const tone = String(formData.get("tone") ?? "").trim() || undefined;

  if (!topic) throw new Error("Topic is required");
  if (!["linkedin", "twitter", "instagram"].includes(platform)) {
    throw new Error("Invalid platform");
  }

  const { output } = await generateSocialPost({ topic, platform, tone });
  const promptSummary = `platform=${platform}${tone ? `, tone=${tone}` : ""} :: ${topic}`;
  const id = await persist("social_post", user.id, promptSummary, output, { platform, tone });
  return { id, output };
}

export async function runObjectionAction(formData: FormData): Promise<GenResult> {
  const user = await currentUser();
  const objection = String(formData.get("objection") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim() || undefined;

  if (!objection) throw new Error("Objection is required");

  const { output } = await generateObjectionResponse({ objection, context });
  const promptSummary = [objection, context ? `(ctx: ${context})` : ""].join(" ").trim();
  const id = await persist("objection_response", user.id, promptSummary, output, {});
  return { id, output };
}

export async function runProspectIntelAction(formData: FormData): Promise<GenResult> {
  const user = await currentUser();
  const prospect_name = String(formData.get("prospect_name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || undefined;
  const known_facts = String(formData.get("known_facts") ?? "").trim() || undefined;
  const source = String(formData.get("source") ?? "").trim() || undefined;

  if (!prospect_name) throw new Error("Prospect name is required");

  const { output } = await generateProspectIntel({
    prospect_name,
    company,
    known_facts,
    source,
  });
  const promptSummary = `${prospect_name}${company ? ` @ ${company}` : ""}`;
  const id = await persist("prospect_intel", user.id, promptSummary, output, {});
  return { id, output };
}
