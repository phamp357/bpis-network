import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  DEAL_PHASES,
  STATUS_STYLES,
  formatCurrency,
  statusLabel,
} from "@/lib/deals";

export default async function CommandDashboardPage() {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("id, name, target_entity, phase, status, estimated_value, updated_at")
    .neq("status", "dead")
    .order("updated_at", { ascending: false });

  const dealsByPhase = Object.fromEntries(
    DEAL_PHASES.map((p) => [p.value, [] as NonNullable<typeof deals>])
  ) as Record<string, NonNullable<typeof deals>>;

  for (const d of deals ?? []) {
    if (dealsByPhase[d.phase]) {
      dealsByPhase[d.phase].push(d);
    }
  }

  const activeCount = (deals ?? []).filter((d) => d.status === "active").length;
  const totalValue = (deals ?? []).reduce(
    (sum, d) => sum + Number(d.estimated_value ?? 0),
    0
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 8</div>
          <h1 className="text-3xl font-semibold tracking-tight">Command Dashboard</h1>
          <p className="text-white/60 mt-2">
            Deal pipeline across 5 phases — from identification to operation.
          </p>
        </div>
        <Link
          href="/command-dashboard/new"
          className="shrink-0 rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
        >
          New deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Stat label="Active deals" value={activeCount.toString()} />
        <Stat label="Total deals" value={(deals?.length ?? 0).toString()} />
        <Stat label="Pipeline value" value={formatCurrency(totalValue)} />
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {DEAL_PHASES.map((p) => {
          const column = dealsByPhase[p.value] ?? [];
          return (
            <div key={p.value} className="rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">{p.short}</div>
                  <div className="text-sm font-medium">
                    {p.label.split("—")[1]?.trim() ?? p.label}
                  </div>
                </div>
                <div className="text-xs text-white/50 bg-white/5 rounded px-1.5 py-0.5">
                  {column.length}
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {column.length === 0 && (
                  <div className="text-xs text-white/30 text-center py-6">—</div>
                )}
                {column.map((d) => (
                  <Link
                    key={d.id}
                    href={`/command-dashboard/${d.id}`}
                    className="block rounded-md border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-3 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-medium leading-tight">{d.name}</div>
                      <span
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${STATUS_STYLES[d.status] ?? ""}`}
                      >
                        {statusLabel(d.status)}
                      </span>
                    </div>
                    {d.target_entity && (
                      <div className="text-xs text-white/50 truncate">{d.target_entity}</div>
                    )}
                    {d.estimated_value != null && (
                      <div className="text-xs text-white/70 mt-2">
                        {formatCurrency(Number(d.estimated_value))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
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
