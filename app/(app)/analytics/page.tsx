import { createClient } from "@/lib/supabase/server";
import { formatCurrency, phaseShort, DEAL_PHASES } from "@/lib/deals";

type EventRow = {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: unknown;
  occurred_at: string;
  users: { email: string } | null;
};

const EVENT_LABELS: Record<string, string> = {
  "oracle.assessment.analyzed": "ORACLE assessment",
  "covenant.assessment.analyzed": "COVENANT assessment",
  "intelligence.generated": "Intelligence content",
  "partner.created": "Partner added",
  "partner.vetting_status_changed": "Partner vetting",
  "deal.created": "Deal created",
  "deal.updated": "Deal updated",
  "deal.phase_changed": "Deal phase change",
  "deal.status_changed": "Deal status change",
  "deal.oocemr_analyzed": "OOCEMR analysis",
  "purchase.paid": "Purchase completed",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: deals },
    { data: assessments },
    { data: partners },
    { data: content },
    { data: recs },
    { data: events },
    { data: purchases },
  ] = await Promise.all([
    supabase.from("deals").select("id, phase, status, estimated_value"),
    supabase.from("assessments").select("id, agent_type, status"),
    supabase.from("partners").select("id, vetting_status"),
    supabase.from("content_assets").select("id, asset_type, created_at"),
    supabase.from("recommendations").select("id, readiness_tier, recommended_package_id"),
    supabase
      .from("events")
      .select("id, event_type, entity_type, entity_id, payload, occurred_at, users(email)")
      .order("occurred_at", { ascending: false })
      .limit(25),
    supabase.from("purchases").select("id, status, amount_cents"),
  ]);

  // === Headline stats ===
  const activeDeals = (deals ?? []).filter((d) => d.status === "active").length;
  const pipelineValue = (deals ?? []).reduce(
    (sum, d) => sum + Number(d.estimated_value ?? 0),
    0
  );
  const approvedPartners =
    (partners ?? []).filter((p) => p.vetting_status === "approved").length;

  // Content in last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const contentThisWeek = (content ?? []).filter(
    (c) => new Date(c.created_at).getTime() > weekAgo
  ).length;

  // === Funnel ===
  const oracleCount = (assessments ?? []).filter((a) => a.agent_type === "oracle").length;
  const covenantCount = (assessments ?? []).filter((a) => a.agent_type === "covenant").length;
  const paidCount = (purchases ?? []).filter((p) => p.status === "paid").length;

  // === Tier mix (ORACLE) ===
  const tierMix = { foundation: 0, activation: 0, mastery: 0 };
  for (const r of recs ?? []) {
    if (r.readiness_tier && r.readiness_tier in tierMix) {
      tierMix[r.readiness_tier as keyof typeof tierMix]++;
    }
  }

  // === Package mix (COVENANT) ===
  const packageRecs = (recs ?? []).filter((r) => !!r.recommended_package_id);
  // Look up package codes for the ones we have
  const pkgIds = Array.from(
    new Set(packageRecs.map((r) => r.recommended_package_id).filter(Boolean))
  ) as string[];
  const { data: pkgs } = pkgIds.length
    ? await supabase.from("packages").select("id, code").in("id", pkgIds)
    : { data: [] as { id: string; code: string }[] };
  const codeById = new Map((pkgs ?? []).map((p) => [p.id, p.code]));
  const packageMix = { essential: 0, builder: 0, sovereign: 0 };
  for (const r of packageRecs) {
    const code = codeById.get(r.recommended_package_id!);
    if (code && code in packageMix) {
      packageMix[code as keyof typeof packageMix]++;
    }
  }

  // === Deal phase distribution ===
  const phaseCounts = Object.fromEntries(
    DEAL_PHASES.map((p) => [p.value, 0])
  ) as Record<string, number>;
  for (const d of deals ?? []) {
    if (d.status !== "dead" && phaseCounts[d.phase] !== undefined) {
      phaseCounts[d.phase]++;
    }
  }
  const maxPhase = Math.max(1, ...Object.values(phaseCounts));

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 9</div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-white/60 mt-2">
          Funnel, pipeline, tier mix, and the last 25 events across the system.
        </p>
      </div>

      {/* Headline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Active deals" value={activeDeals.toString()} />
        <Stat label="Pipeline value" value={formatCurrency(pipelineValue)} />
        <Stat label="Approved partners" value={approvedPartners.toString()} />
        <Stat label="Content this week" value={contentThisWeek.toString()} />
      </div>

      {/* Funnel */}
      <Section title="Funnel">
        <div className="grid grid-cols-3 gap-3">
          <FunnelStep label="ORACLE" value={oracleCount} />
          <FunnelStep label="COVENANT" value={covenantCount} />
          <FunnelStep label="Paid" value={paidCount} />
        </div>
      </Section>

      {/* Tier + Package mix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Section title="ORACLE readiness tiers" tight>
          <MixBars
            entries={[
              { key: "foundation", label: "Foundation", value: tierMix.foundation, color: "bg-amber-500/50" },
              { key: "activation", label: "Activation", value: tierMix.activation, color: "bg-cyan-500/50" },
              { key: "mastery", label: "Mastery", value: tierMix.mastery, color: "bg-emerald-500/50" },
            ]}
          />
        </Section>
        <Section title="COVENANT package mix" tight>
          <MixBars
            entries={[
              { key: "essential", label: "Essential", value: packageMix.essential, color: "bg-slate-400/50" },
              { key: "builder", label: "Builder", value: packageMix.builder, color: "bg-indigo-500/50" },
              { key: "sovereign", label: "Sovereign", value: packageMix.sovereign, color: "bg-fuchsia-500/50" },
            ]}
          />
        </Section>
      </div>

      {/* Deal phase distribution */}
      <Section title="Deal phase distribution">
        <div className="space-y-2">
          {DEAL_PHASES.map((p) => {
            const count = phaseCounts[p.value] ?? 0;
            const pct = (count / maxPhase) * 100;
            return (
              <div key={p.value} className="flex items-center gap-3">
                <div className="w-20 text-xs text-white/60 shrink-0">{phaseShort(p.value)}</div>
                <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-white/20"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-8 text-right text-sm text-white/80 shrink-0">{count}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Recent events */}
      <Section title="Recent activity">
        <ul className="divide-y divide-white/10">
          {(events ?? []).map((e) => {
            const userEmail = Array.isArray(e.users)
              ? e.users[0]?.email
              : (e as unknown as EventRow).users?.email;
            const label = EVENT_LABELS[e.event_type] ?? e.event_type;
            return (
              <li key={e.id} className="py-2.5 flex items-start gap-3 text-sm">
                <div className="text-xs text-white/40 shrink-0 w-32">
                  {new Date(e.occurred_at).toLocaleString()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white/90">{label}</span>
                  {userEmail && (
                    <span className="text-white/40 text-xs ml-2">{userEmail}</span>
                  )}
                </div>
              </li>
            );
          })}
          {(events ?? []).length === 0 && (
            <li className="py-4 text-sm text-white/50 text-center">No events yet.</li>
          )}
        </ul>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
  tight,
}: {
  title: string;
  children: React.ReactNode;
  tight?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/[0.03] ${tight ? "p-4" : "p-5"} mb-6`}>
      <div className="text-xs uppercase tracking-wider text-white/40 mb-3">{title}</div>
      {children}
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-4 text-center">
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function MixBars({
  entries,
}: {
  entries: Array<{ key: string; label: string; value: number; color: string }>;
}) {
  const max = Math.max(1, ...entries.map((e) => e.value));
  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const pct = (e.value / max) * 100;
        return (
          <div key={e.key} className="flex items-center gap-3">
            <div className="w-24 text-xs text-white/60 shrink-0">{e.label}</div>
            <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
              <div className={`h-full ${e.color}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-6 text-right text-xs text-white/70 shrink-0">{e.value}</div>
          </div>
        );
      })}
    </div>
  );
}
