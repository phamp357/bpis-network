import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UCC_STATUSES, UCC_STATUS_STYLES, uccStatusLabel } from "@/lib/deals";

type SearchParams = Promise<{ status?: string; state?: string }>;

export default async function UccWealthEnginePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status, state } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("ucc_filings")
    .select(
      "id, deal_id, filing_state, filing_number, debtor, secured_party, status, filed_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") query = query.eq("status", status as never);
  if (state && state.trim()) query = query.eq("filing_state", state.trim().toUpperCase());

  const { data: filings } = await query;

  const dealIds = Array.from(new Set((filings ?? []).map((f) => f.deal_id)));
  const { data: deals } = dealIds.length
    ? await supabase.from("deals").select("id, name").in("id", dealIds)
    : { data: [] as { id: string; name: string }[] };
  const dealById = new Map((deals ?? []).map((d) => [d.id, d]));

  // Stats
  const total = filings?.length ?? 0;
  const byStatus = (filings ?? []).reduce<Record<string, number>>((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1;
    return acc;
  }, {});

  function href(next: { status?: string; state?: string }) {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const st = next.state ?? state;
    if (s && s !== "all") params.set("status", s);
    if (st) params.set("state", st);
    const str = params.toString();
    return str ? `/ucc-wealth-engine?${str}` : "/ucc-wealth-engine";
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 8</div>
        <h1 className="text-3xl font-semibold tracking-tight">UCC Wealth Engine</h1>
        <p className="text-white/60 mt-2 max-w-xl">
          Every UCC filing across every deal — drafts, filed, amended, terminated. OOCEMR
          analysis + PDF export arrive in Phase 8b.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Total" value={total.toString()} />
        {UCC_STATUSES.map((s) => (
          <Stat key={s.value} label={s.label} value={(byStatus[s.value] ?? 0).toString()} />
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 mb-6 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-white/40">Status:</span>
        <Link
          href={href({ status: "all" })}
          className={`px-2 py-0.5 rounded ${!status || status === "all" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
        >
          All
        </Link>
        {UCC_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={href({ status: s.value })}
            className={`px-2 py-0.5 rounded ${status === s.value ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
          >
            {s.label}
          </Link>
        ))}

        <form action="/ucc-wealth-engine" method="get" className="flex items-center gap-2 ml-auto">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="text-white/40">State:</label>
          <input
            type="text"
            name="state"
            maxLength={2}
            defaultValue={state ?? ""}
            placeholder="TX"
            className="w-16 rounded bg-black/40 border border-white/10 px-2 py-0.5 text-white uppercase focus:outline-none focus:border-white/30"
          />
          <button type="submit" className="rounded bg-white/10 px-2 py-0.5 text-white hover:bg-white/15">
            Filter
          </button>
          {state && (
            <Link href={href({ state: "" })} className="text-white/50 hover:text-white">
              clear
            </Link>
          )}
        </form>
      </div>

      {(!filings || filings.length === 0) && (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60 mb-3">No UCC filings match.</p>
          <Link
            href="/command-dashboard"
            className="text-sm text-white underline underline-offset-2"
          >
            Add one from a deal →
          </Link>
        </div>
      )}

      {filings && filings.length > 0 && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">State</th>
                <th className="text-left px-4 py-3 font-medium">Debtor</th>
                <th className="text-left px-4 py-3 font-medium">Deal</th>
                <th className="text-left px-4 py-3 font-medium">Filing #</th>
                <th className="text-left px-4 py-3 font-medium">Filed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filings.map((f) => {
                const deal = dealById.get(f.deal_id);
                return (
                  <tr
                    key={f.id}
                    className="border-t border-white/10 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${UCC_STATUS_STYLES[f.status] ?? ""}`}
                      >
                        {uccStatusLabel(f.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80">{f.filing_state}</td>
                    <td className="px-4 py-3 text-white/90">{f.debtor}</td>
                    <td className="px-4 py-3 text-white/70 truncate max-w-[220px]">
                      {deal?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {f.filing_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {f.filed_at ? new Date(f.filed_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/command-dashboard/${f.deal_id}`}
                        className="text-white/70 hover:text-white text-sm"
                      >
                        View deal →
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-xl font-semibold mt-0.5">{value}</div>
    </div>
  );
}
