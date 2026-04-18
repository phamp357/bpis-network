import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COVENANT_QUESTIONS } from "@/lib/claude/covenant";
import { isStripeEnabled } from "@/lib/stripe/config";
import BuyPackageButton from "./BuyPackageButton";

const PACKAGE_STYLES: Record<string, { badge: string; accent: string }> = {
  essential: {
    badge: "bg-slate-500/15 text-slate-200 border-slate-500/30",
    accent: "border-slate-500/30",
  },
  builder: {
    badge: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
    accent: "border-indigo-500/30",
  },
  sovereign: {
    badge: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30",
    accent: "border-fuchsia-500/30",
  },
};

export default async function CovenantResultPage({
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
    .eq("agent_type", "covenant")
    .maybeSingle();

  if (!assessment) {
    notFound();
  }

  const { data: rec } = await supabase
    .from("recommendations")
    .select("score, strategy_notes, recommended_package_id, created_at")
    .eq("assessment_id", id)
    .maybeSingle();

  const { data: userRow } = await supabase
    .from("users")
    .select("email")
    .eq("id", assessment.user_id)
    .maybeSingle();

  const { data: pkg } = rec?.recommended_package_id
    ? await supabase
        .from("packages")
        .select("id, code, name, description, price, features, stripe_price_id")
        .eq("id", rec.recommended_package_id)
        .maybeSingle()
    : { data: null };

  const stripeEnabled = isStripeEnabled();

  const email = userRow?.email ?? null;
  const style = pkg?.code ? PACKAGE_STYLES[pkg.code] : null;
  const responses = (assessment.responses ?? {}) as Record<string, string>;
  const features = Array.isArray(pkg?.features) ? (pkg.features as string[]) : [];

  return (
    <div className="max-w-3xl">
      <div className="mb-2">
        <Link href="/covenant" className="text-sm text-white/50 hover:text-white/80">
          ← Back to assessments
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">COVENANT result</h1>
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
            recommendation. Retry from the COVENANT list.
          </p>
        </div>
      )}

      {rec && pkg && style && (
        <div className={`rounded-xl border bg-white/[0.04] p-6 mb-8 ${style.accent}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                Recommended package
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-semibold">{pkg.name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full border ${style.badge}`}>
                  {pkg.code}
                </span>
              </div>
              {pkg.price && (
                <div className="text-white/60 text-sm mt-1">
                  ${Number(pkg.price).toLocaleString()}
                </div>
              )}
              {pkg.description && (
                <p className="text-white/70 text-sm mt-3 max-w-xl">{pkg.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs uppercase tracking-wider text-white/40 mb-1">
                Confidence
              </div>
              <div className="text-3xl font-semibold">{rec.score}</div>
              <div className="text-white/40 text-xs">/ 100</div>
            </div>
          </div>

          {features.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                What's included
              </div>
              <ul className="space-y-1 text-sm text-white/80">
                {features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-white/40">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
              Strategy notes
            </div>
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {rec.strategy_notes}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
            <BuyPackageButton
              packageId={pkg.id}
              packageName={pkg.name}
              stripeEnabled={stripeEnabled}
              hasStripePrice={!!pkg.stripe_price_id}
            />
          </div>
        </div>
      )}

      <div className="mb-2">
        <h2 className="text-xs uppercase tracking-wider text-white/40">Responses</h2>
      </div>
      <div className="space-y-3">
        {COVENANT_QUESTIONS.map((q, i) => (
          <div
            key={q.key}
            className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
          >
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
