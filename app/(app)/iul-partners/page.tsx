import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  PARTNER_TYPES,
  VETTING_STATUSES,
  VETTING_STYLES,
  TYPE_STYLES,
  typeLabel,
  vettingLabel,
} from "@/lib/partners";

type SearchParams = Promise<{ type?: string; status?: string; q?: string }>;

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { type, status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("partners")
    .select("id, full_name, company, type, email, license_state, vetting_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (type && type !== "all") query = query.eq("type", type as never);
  if (status && status !== "all") query = query.eq("vetting_status", status as never);
  if (q && q.trim()) {
    const pattern = `%${q.trim()}%`;
    query = query.or(`full_name.ilike.${pattern},company.ilike.${pattern},email.ilike.${pattern}`);
  }

  const { data: partners } = await query;

  function href(next: { type?: string; status?: string; q?: string }) {
    const params = new URLSearchParams();
    const t = next.type ?? type;
    const s = next.status ?? status;
    const qq = next.q ?? q;
    if (t && t !== "all") params.set("type", t);
    if (s && s !== "all") params.set("status", s);
    if (qq) params.set("q", qq);
    const str = params.toString();
    return str ? `/iul-partners?${str}` : "/iul-partners";
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6 gap-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 7</div>
          <h1 className="text-3xl font-semibold tracking-tight">Partner Network</h1>
          <p className="text-white/60 mt-2 max-w-xl">
            IUL advisors, legal, CPA, and broker partners. Vet once, reuse across clients.
          </p>
        </div>
        <Link
          href="/iul-partners/new"
          className="shrink-0 rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
        >
          Add partner
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 mb-6 space-y-3">
        <form action="/iul-partners" method="get" className="flex gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, company, email…"
            className="flex-1 rounded-md bg-black/40 border border-white/10 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15"
          >
            Search
          </button>
          {q && (
            <Link
              href={href({ q: "" })}
              className="rounded-md text-white/50 text-sm px-3 py-1.5 hover:text-white"
            >
              Clear
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-white/40">Type:</span>
            <Link
              href={href({ type: "all" })}
              className={`px-2 py-0.5 rounded ${!type || type === "all" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
            >
              All
            </Link>
            {PARTNER_TYPES.map((t) => (
              <Link
                key={t.value}
                href={href({ type: t.value })}
                className={`px-2 py-0.5 rounded ${type === t.value ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-white/40">Status:</span>
            <Link
              href={href({ status: "all" })}
              className={`px-2 py-0.5 rounded ${!status || status === "all" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
            >
              All
            </Link>
            {VETTING_STATUSES.map((s) => (
              <Link
                key={s.value}
                href={href({ status: s.value })}
                className={`px-2 py-0.5 rounded ${status === s.value ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {(!partners || partners.length === 0) && (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60 mb-4">No partners match these filters.</p>
          <Link
            href="/iul-partners/new"
            className="inline-block rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
          >
            Add your first partner
          </Link>
        </div>
      )}

      {partners && partners.length > 0 && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Company</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">State</th>
                <th className="text-left px-4 py-3 font-medium">Vetting</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/90 font-medium">{p.full_name}</td>
                  <td className="px-4 py-3 text-white/70">{p.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[p.type] ?? ""}`}>
                      {typeLabel(p.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{p.license_state ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${VETTING_STYLES[p.vetting_status] ?? ""}`}>
                      {vettingLabel(p.vetting_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/iul-partners/${p.id}`}
                      className="text-white/70 hover:text-white text-sm"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
