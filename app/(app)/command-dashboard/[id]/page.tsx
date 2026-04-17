import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_STYLES,
  formatCurrency,
  phaseShort,
  statusLabel,
} from "@/lib/deals";
import DealPhaseControls from "./DealPhaseControls";
import DealOverviewEditor from "./DealOverviewEditor";
import CapitalStack from "./CapitalStack";
import UccFilings from "./UccFilings";
import DealDangerZone from "./DealDangerZone";

type SearchParams = Promise<{ edit?: string }>;

export default async function DealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === "1";

  const supabase = await createClient();

  const { data: deal } = await supabase
    .from("deals")
    .select(
      "id, name, target_entity, phase, status, estimated_value, notes, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!deal) {
    notFound();
  }

  const [{ data: stack }, { data: filings }] = await Promise.all([
    supabase
      .from("capital_stack_items")
      .select("id, tier, source, amount, terms, order_index")
      .eq("deal_id", id)
      .order("order_index", { ascending: true }),
    supabase
      .from("ucc_filings")
      .select(
        "id, filing_state, filing_number, debtor, secured_party, collateral_description, status, filed_at, created_at"
      )
      .eq("deal_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const stackTotal = (stack ?? []).reduce((sum, s) => sum + Number(s.amount ?? 0), 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-2">
        <Link
          href="/command-dashboard"
          className="text-sm text-white/50 hover:text-white/80"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{deal.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full border border-white/15 text-white/70">
              {phaseShort(deal.phase)}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[deal.status] ?? ""}`}
            >
              {statusLabel(deal.status)}
            </span>
            {deal.target_entity && (
              <span className="text-sm text-white/60">{deal.target_entity}</span>
            )}
          </div>
        </div>
        {!isEditing && (
          <Link
            href={`/command-dashboard/${deal.id}?edit=1`}
            className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15"
          >
            Edit
          </Link>
        )}
      </div>

      {/* Phase + status controls */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 mb-6">
        <DealPhaseControls
          id={deal.id}
          phase={deal.phase}
          status={deal.status}
        />
      </div>

      {/* Overview */}
      {isEditing ? (
        <div className="mb-6">
          <DealOverviewEditor deal={deal} />
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 mb-6">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Overview
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Field label="Estimated value">
              {formatCurrency(
                deal.estimated_value != null ? Number(deal.estimated_value) : null
              )}
            </Field>
            <Field label="Capital raised">{formatCurrency(stackTotal)}</Field>
          </dl>
          {deal.notes && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 mb-1">Notes</div>
              <p className="text-sm text-white/85 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Capital stack */}
      <CapitalStack dealId={deal.id} items={stack ?? []} />

      {/* UCC filings */}
      <UccFilings dealId={deal.id} filings={filings ?? []} />

      {/* Danger zone */}
      <div className="mt-10">
        <DealDangerZone id={deal.id} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-white/40 mb-0.5">{label}</dt>
      <dd className="text-white/90">{children}</dd>
    </div>
  );
}
