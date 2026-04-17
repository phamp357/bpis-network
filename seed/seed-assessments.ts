import { adminClient, log } from "./_common";

export async function seedAssessments(founderIds: string[]) {
  if (founderIds.length === 0) {
    log("assessments", "no founder ids — skipping");
    return;
  }
  const db = adminClient();

  // Look up package ids
  const { data: packages } = await db.from("packages").select("id, code");
  const pkgByCode = Object.fromEntries((packages ?? []).map((p) => [p.code, p.id]));

  // ORACLE assessment for founder 0
  const { data: oracle, error: oracleErr } = await db
    .from("assessments")
    .insert({
      user_id: founderIds[0],
      agent_type: "oracle" as const,
      status: "analyzed" as const,
      responses: {
        q1_current_revenue: "150k-500k",
        q2_primary_bottleneck: "Client acquisition inconsistency",
        q3_team_structure: "Solo founder + 2 contractors",
        q4_spiritual_alignment: "Strong — daily practice, weekly accountability",
        q5_goal_horizon_12mo: "Hit $1M ARR, add first full-time hire",
        q6_biggest_fear: "Scaling kills the founder's discipline",
        q7_ideal_outcome: "Team of five, replicable systems, 20+ hours back per week",
      },
      submitted_at: new Date().toISOString(),
      is_mock: true,
    })
    .select("id")
    .single();
  if (oracleErr) throw oracleErr;

  if (oracle) {
    const { error } = await db.from("recommendations").insert({
      assessment_id: oracle.id,
      readiness_tier: "activation" as const,
      score: 72,
      strategy_notes:
        "Strong foundation, aligned discipline. Needs systems-first operating rhythm. Recommend Activation cohort + Builder legal package.",
      is_mock: true,
    });
    if (error) throw error;
  }

  // COVENANT assessment for founder 1 (if we have one)
  if (founderIds[1] && pkgByCode.builder) {
    const { data: covenant, error: covErr } = await db
      .from("assessments")
      .insert({
        user_id: founderIds[1],
        agent_type: "covenant" as const,
        status: "analyzed" as const,
        responses: {
          business_stage: "early",
          team_size: 4,
          funding_goal: 250000,
          state_of_formation: "TX",
        },
        submitted_at: new Date().toISOString(),
        is_mock: true,
      })
      .select("id")
      .single();
    if (covErr) throw covErr;

    if (covenant) {
      const { error } = await db.from("recommendations").insert({
        assessment_id: covenant.id,
        recommended_package_id: pkgByCode.builder,
        score: 68,
        strategy_notes:
          "Early-stage with a small team. Builder package covers contracts, IP, and team structuring needed in the next 6 months.",
        is_mock: true,
      });
      if (error) throw error;
    }
  }

  log("assessments", "seeded ORACLE + COVENANT assessments with recommendations");
}
