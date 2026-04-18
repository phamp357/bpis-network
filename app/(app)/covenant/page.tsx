import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PACKAGE_STYLES: Record<string, string> = {
  essential: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  builder: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  sovereign: "bg-brand/15 text-brand border-brand/40",
};

export default async function CovenantPage() {
  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, status, submitted_at, created_at, user_id")
    .eq("agent_type", "covenant")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch related data in parallel — simpler than nested selects
  const ids = (assessments ?? []).map((a) => a.id);
  const userIds = (assessments ?? []).map((a) => a.user_id);

  const [{ data: recs }, { data: users }] = await Promise.all([
    ids.length
      ? supabase
          .from("recommendations")
          .select("assessment_id, score, recommended_package_id")
          .in("assessment_id", ids)
      : Promise.resolve({ data: [] as { assessment_id: string; score: number | null; recommended_package_id: string | null }[] }),
    userIds.length
      ? supabase.from("users").select("id, email").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; email: string }[] }),
  ]);

  const pkgIds = (recs ?? [])
    .map((r) => r.recommended_package_id)
    .filter((x): x is string => !!x);
  const { data: packages } = pkgIds.length
    ? await supabase.from("packages").select("id, code, name").in("id", pkgIds)
    : { data: [] as { id: string; code: string; name: string }[] };

  const recByAssessment = new Map((recs ?? []).map((r) => [r.assessment_id, r]));
  const userByid = new Map((users ?? []).map((u) => [u.id, u]));
  const pkgById = new Map((packages ?? []).map((p) => [p.id, p]));

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 5</div>
          <h1 className="text-3xl font-semibold tracking-tight">COVENANT</h1>
          <p className="text-white/60 mt-2 max-w-xl">
            Legal Foundation Agent — 6 questions, then Claude recommends Essential,
            Builder, or Sovereign with strategy notes.
          </p>
        </div>
        <Link
          href="/covenant/new"
          className="shrink-0 rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
        >
          New assessment
        </Link>
      </div>

      {(!assessments || assessments.length === 0) && (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60 mb-4">No assessments yet.</p>
          <Link
            href="/covenant/new"
            className="inline-block rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
          >
            Run your first COVENANT
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
                <th className="text-left px-4 py-3 font-medium">Package</th>
                <th className="text-left px-4 py-3 font-medium">Confidence</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const rec = recByAssessment.get(a.id);
                const email = userByid.get(a.user_id)?.email;
                const pkg = rec?.recommended_package_id
                  ? pkgById.get(rec.recommended_package_id)
                  : null;
                const date = new Date(a.submitted_at ?? a.created_at).toLocaleDateString();
                return (
                  <tr key={a.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/80">{email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/60">{a.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {pkg ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${PACKAGE_STYLES[pkg.code] ?? ""}`}
                        >
                          {pkg.name.replace("COVENANT ", "")}
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/80">{rec?.score ?? "—"}</td>
                    <td className="px-4 py-3 text-white/60">{date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/covenant/${a.id}`}
                        className="text-white/70 hover:text-white text-sm"
                      >
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
