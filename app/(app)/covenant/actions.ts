"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  COVENANT_QUESTIONS,
  runCovenantAnalysis,
  type CovenantResponses,
} from "@/lib/claude/covenant";

export async function submitCovenantAssessment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Collect and validate responses
  const responses = {} as CovenantResponses;
  for (const q of COVENANT_QUESTIONS) {
    const raw = String(formData.get(q.key) ?? "").trim();
    if (!raw) {
      throw new Error(`Missing answer for: ${q.label}`);
    }
    responses[q.key] = raw;
  }

  // Normalize state to uppercase
  responses.state_of_formation = responses.state_of_formation.toUpperCase();

  const { data: assessment, error: insertErr } = await supabase
    .from("assessments")
    .insert({
      user_id: user.id,
      agent_type: "covenant",
      status: "submitted",
      responses,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insertErr || !assessment) {
    throw new Error(insertErr?.message ?? "Failed to create assessment");
  }

  let analysis;
  let raw;
  try {
    const result = await runCovenantAnalysis(responses);
    analysis = result.analysis;
    raw = result.raw;
  } catch (err) {
    console.error("COVENANT analysis failed:", err);
    throw new Error(
      "COVENANT analysis failed. The assessment was saved — you can retry later."
    );
  }

  // Look up the recommended package id
  const { data: pkg } = await supabase
    .from("packages")
    .select("id")
    .eq("code", analysis.recommended_package_code)
    .maybeSingle();

  const { error: recErr } = await supabase.from("recommendations").insert({
    assessment_id: assessment.id,
    recommended_package_id: pkg?.id ?? null,
    score: analysis.score,
    strategy_notes: analysis.strategy_notes,
    raw_ai_output: raw as never,
  });
  if (recErr) throw new Error(recErr.message);

  const { error: updErr } = await supabase
    .from("assessments")
    .update({ status: "analyzed" })
    .eq("id", assessment.id);
  if (updErr) throw new Error(updErr.message);

  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "covenant.assessment.analyzed",
    entity_type: "assessments",
    entity_id: assessment.id,
    payload: {
      score: analysis.score,
      package_code: analysis.recommended_package_code,
    },
  });

  redirect(`/covenant/${assessment.id}`);
}
