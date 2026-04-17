import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TYPE_STYLES, VETTING_STYLES, typeLabel, vettingLabel } from "@/lib/partners";
import PartnerActions from "./PartnerActions";
import EditPartnerForm from "./EditPartnerForm";

type SearchParams = Promise<{ edit?: string }>;

export default async function PartnerDetailPage({
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
  const { data: partner } = await supabase
    .from("partners")
    .select(
      "id, type, full_name, company, email, phone, license_number, license_state, vetting_status, vetting_notes, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!partner) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-2">
        <Link href="/iul-partners" className="text-sm text-white/50 hover:text-white/80">
          ← Back to partners
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{partner.full_name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[partner.type] ?? ""}`}>
              {typeLabel(partner.type)}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${VETTING_STYLES[partner.vetting_status] ?? ""}`}
            >
              {vettingLabel(partner.vetting_status)}
            </span>
            {partner.company && (
              <span className="text-sm text-white/60">{partner.company}</span>
            )}
          </div>
        </div>
        {!isEditing && (
          <Link
            href={`/iul-partners/${partner.id}?edit=1`}
            className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15"
          >
            Edit
          </Link>
        )}
      </div>

      {isEditing ? (
        <EditPartnerForm partner={partner} />
      ) : (
        <div className="space-y-6">
          {/* Vetting quick actions */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">
              Vetting
            </div>
            <PartnerActions id={partner.id} status={partner.vetting_status} />
            {partner.vetting_notes && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/40 mb-1">Notes</div>
                <p className="text-sm text-white/80 whitespace-pre-wrap">
                  {partner.vetting_notes}
                </p>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">
              Contact
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Field label="Email" value={partner.email} />
              <Field label="Phone" value={partner.phone} />
              <Field label="License number" value={partner.license_number} />
              <Field label="License state" value={partner.license_state} />
            </dl>
          </div>

          <div className="text-xs text-white/40">
            Added {new Date(partner.created_at).toLocaleDateString()} • Updated{" "}
            {new Date(partner.updated_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-white/40 mb-0.5">{label}</dt>
      <dd className="text-white/85">{value ?? <span className="text-white/30">—</span>}</dd>
    </div>
  );
}
