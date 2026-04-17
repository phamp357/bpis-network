import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORACLE_QUESTIONS } from "@/lib/claude/oracle";

const TIER_STYLES: Record<string, { badge: string; label: string; blurb: string }> = {
  foundation: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    label: "Foundation",
    blurb: "Build discipline, clarity, and core fundamentals before scaling.",
  },
  activation: {
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    label: "Activation",
    blurb: "Baseline is solid — the work is systems, team, and reinvestment.",
  },
  mastery: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: "Mastery",
    blurb: "Fundamentals are in place. Focus shifts to legacy, acquisition, and capital.",
  },
};

export default async function OracleResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, user_id, status, responses, submitted_at")
    .eq("id", id)
    .eq("agent_type", "oracle")
    .maybeSingle();

  if (!assessment) {
    notFound();
  }

  const { data: rec } = await supabase
    .from("recommendations")
    .select("score, readiness_tier, strategy_notes, created_at")
    .eq("assessment_id", id)
    .maybeSingle();

  const { data: userRow } = await supabase
    .from("users")
    .select("email")
    .eq("id", assessment.user_id)
    .maybeSingle();

  const email = userRow?.email ?? null;
  const tier = rec?.readiness_tier ?? null;
  const tierStyle = tier ? TIER_STYLES[tier] : null;
  const responses = (assessment.responses ?? {}) as Record<string, string>;

  return (
    <div className="max-w-3xl">
      <div className="mb-2">
        <Link href="/oracle" className="text-sm text-white/50 hover:text-white/80">
          ← Back to assessments
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">ORACLE result</h1>
        <p className="text-white/60 mt-2">
          {email ?? "Unknown client"} • submitted{" "}
          {assessment.submitted_at
            ? new Date(assessment.submitted_at).toLocaleString()
            : "—"}
        </p>
      </div>

      {!rec && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 mb-8">
          <p className="text-amber-200 font-medium">Analysis not yet complete</p>
          <p className="text-sm text-amber-200/70 mt-1">
            Status: {assessment.status}. The assessment was saved but Claude did not return a
            recommendation. Retry from the ORACLE list.
          </p>
        </div>
      )}

      {rec && tierStyle && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                Readiness
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full border ${tierStyle.badge}`}>
                  {tierStyle.label}
                </span>
                <span className="text-2xl font-semibold">{rec.score}</span>
                <span className="text-white/40 text-sm">/ 100</span>
              </div>
              <p className="text-white/60 text-sm mt-2">{tierStyle.blurb}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
              Strategy notes
            </div>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {rec.strategy_notes}
            </p>
          </div>
        </div>
      )}

      <div className="mb-2">
        <h2 className="text-xs uppercase tracking-wider text-white/40">Responses</h2>
      </div>
      <div className="space-y-3">
        {ORACLE_QUESTIONS.map((q, i) => (
          <div key={q.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="text-xs text-white/40 mb-1">
              Q{i + 1} • {q.label}
            </div>
            <div className="text-sm text-white/80 whitespace-pre-wrap">
              {responses[q.key] || <span className="text-white/30">—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
