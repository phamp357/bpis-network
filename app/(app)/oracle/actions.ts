"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ORACLE_QUESTIONS,
  runOracleAnalysis,
  type OracleResponses,
} from "@/lib/claude/oracle";

export async function submitOracleAssessment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Collect and validate responses
  const responses = {} as OracleResponses;
  for (const q of ORACLE_QUESTIONS) {
    const value = String(formData.get(q.key) ?? "").trim();
    if (!value) {
      throw new Error(`Missing answer for: ${q.label}`);
    }
    responses[q.key] = value;
  }

  // 1. Persist the assessment as submitted (pre-analysis)
  const { data: assessment, error: insertErr } = await supabase
    .from("assessments")
    .insert({
      user_id: user.id,
      agent_type: "oracle",
      status: "submitted",
      responses,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insertErr || !assessment) {
    throw new Error(insertErr?.message ?? "Failed to create assessment");
  }

  // 2. Run Claude analysis
  let analysis;
  let raw;
  try {
    const result = await runOracleAnalysis(responses);
    analysis = result.analysis;
    raw = result.raw;
  } catch (err) {
    // Leave the assessment as submitted (not analyzed) so it's visible + retryable
    console.error("ORACLE analysis failed:", err);
    throw new Error(
      "ORACLE analysis failed. The assessment was saved — you can retry later."
    );
  }

  // 3. Persist the recommendation
  const { error: recErr } = await supabase.from("recommendations").insert({
    assessment_id: assessment.id,
    score: analysis.score,
    readiness_tier: analysis.tier,
    strategy_notes: analysis.strategy_notes,
    raw_ai_output: raw as never,
  });
  if (recErr) throw new Error(recErr.message);

  // 4. Mark assessment as analyzed
  const { error: updErr } = await supabase
    .from("assessments")
    .update({ status: "analyzed" })
    .eq("id", assessment.id);
  if (updErr) throw new Error(updErr.message);

  // 5. Log event
  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "oracle.assessment.analyzed",
    entity_type: "assessments",
    entity_id: assessment.id,
    payload: { score: analysis.score, tier: analysis.tier },
  });

  redirect(`/oracle/${assessment.id}`);
}
