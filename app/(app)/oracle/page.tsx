import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TIER_STYLES: Record<string, string> = {
  foundation: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  activation: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  mastery: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

export default async function OraclePage() {
  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, status, submitted_at, created_at, user_id, users(email), recommendations(score, readiness_tier)")
    .eq("agent_type", "oracle")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 4</div>
          <h1 className="text-3xl font-semibold tracking-tight">ORACLE</h1>
          <p className="text-white/60 mt-2 max-w-xl">
            Client Activation Profile Generator — 7 questions, then Claude Sonnet 4.6 scores
            readiness and names the next move.
          </p>
        </div>
        <Link
          href="/oracle/new"
          className="shrink-0 rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
        >
          New assessment
        </Link>
      </div>

      {(!assessments || assessments.length === 0) && (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60 mb-4">No assessments yet.</p>
          <Link
            href="/oracle/new"
            className="inline-block rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
          >
            Run your first ORACLE
          </Link>
        </div>
      )}

      {assessments && assessments.length > 0 && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Client</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Tier</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const rec = Array.isArray(a.recommendations) ? a.recommendations[0] : null;
                const email = Array.isArray(a.users) ? a.users[0]?.email : (a.users as { email: string } | null)?.email;
                const date = new Date(a.submitted_at ?? a.created_at).toLocaleDateString();
                return (
                  <tr key={a.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/80">{email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/60">{a.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {rec?.readiness_tier ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_STYLES[rec.readiness_tier] ?? ""}`}>
                          {rec.readiness_tier}
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80">{rec?.score ?? "—"}</td>
                    <td className="px-4 py-3 text-white/60">{date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/oracle/${a.id}`} className="text-white/70 hover:text-white text-sm">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
