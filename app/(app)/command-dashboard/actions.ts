"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DealPhase = "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5";
type DealStatus = "active" | "closed" | "dead" | "paused";
type CapitalTier =
  | "senior_debt"
  | "mezzanine"
  | "equity"
  | "ucc_secured"
  | "seller_financing";
type UccStatus = "draft" | "filed" | "amended" | "terminated";

const VALID_PHASES: DealPhase[] = ["phase_1", "phase_2", "phase_3", "phase_4", "phase_5"];
const VALID_STATUSES: DealStatus[] = ["active", "closed", "dead", "paused"];
const VALID_TIERS: CapitalTier[] = [
  "senior_debt",
  "mezzanine",
  "equity",
  "ucc_secured",
  "seller_financing",
];
const VALID_UCC_STATUSES: UccStatus[] = ["draft", "filed", "amended", "terminated"];

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  if (!isFinite(n) || n < 0) throw new Error("Invalid amount");
  return n;
}

// === DEALS ===

export async function createDealAction(formData: FormData) {
  const user = await currentUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const target_entity = String(formData.get("target_entity") ?? "").trim() || null;
  const phase = String(formData.get("phase") ?? "phase_1") as DealPhase;
  const estValRaw = String(formData.get("estimated_value") ?? "").trim();
  const estimated_value = estValRaw ? parseAmount(estValRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Deal name is required");
  if (!VALID_PHASES.includes(phase)) throw new Error("Invalid phase");

  const { data, error } = await supabase
    .from("deals")
    .insert({
      owner_user_id: user.id,
      name,
      target_entity,
      phase,
      status: "active",
      estimated_value,
      notes,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create deal");

  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "deal.created",
    entity_type: "deals",
    entity_id: data.id,
    payload: { name, phase },
  });

  revalidatePath("/command-dashboard");
  redirect(`/command-dashboard/${data.id}`);
}

export async function updateDealAction(id: string, formData: FormData) {
  const user = await currentUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const target_entity = String(formData.get("target_entity") ?? "").trim() || null;
  const estValRaw = String(formData.get("estimated_value") ?? "").trim();
  const estimated_value = estValRaw ? parseAmount(estValRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) throw new Error("Deal name is required");

  const { error } = await supabase
    .from("deals")
    .update({ name, target_entity, estimated_value, notes })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "deal.updated",
    entity_type: "deals",
    entity_id: id,
    payload: { name },
  });

  revalidatePath(`/command-dashboard/${id}`);
  revalidatePath("/command-dashboard");
  redirect(`/command-dashboard/${id}`);
}

export async function setDealPhaseAction(id: string, phase: DealPhase) {
  const user = await currentUser();
  if (!VALID_PHASES.includes(phase)) throw new Error("Invalid phase");
  const supabase = await createClient();

  const { error } = await supabase.from("deals").update({ phase }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "deal.phase_changed",
    entity_type: "deals",
    entity_id: id,
    payload: { phase },
  });

  revalidatePath("/command-dashboard");
  revalidatePath(`/command-dashboard/${id}`);
}

export async function setDealStatusAction(id: string, status: DealStatus) {
  const user = await currentUser();
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");
  const supabase = await createClient();

  const { error } = await supabase.from("deals").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("events").insert({
    user_id: user.id,
    event_type: "deal.status_changed",
    entity_type: "deals",
    entity_id: id,
    payload: { status },
  });

  revalidatePath("/command-dashboard");
  revalidatePath(`/command-dashboard/${id}`);
}

export async function deleteDealAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/command-dashboard");
  redirect("/command-dashboard");
}

// === CAPITAL STACK ===

export async function addCapitalItemAction(dealId: string, formData: FormData) {
  const supabase = await createClient();

  const tier = String(formData.get("tier") ?? "") as CapitalTier;
  const source = String(formData.get("source") ?? "").trim();
  const amount = parseAmount(String(formData.get("amount") ?? ""));
  const rate = String(formData.get("rate") ?? "").trim() || null;
  const term_months = String(formData.get("term_months") ?? "").trim();

  if (!VALID_TIERS.includes(tier)) throw new Error("Invalid capital tier");
  if (!source) throw new Error("Source is required");

  const terms: Record<string, unknown> = {};
  if (rate) terms.rate = rate;
  if (term_months) terms.term_months = Number(term_months);

  // Next order_index
  const { data: existing } = await supabase
    .from("capital_stack_items")
    .select("order_index")
    .eq("deal_id", dealId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

  const { error } = await supabase.from("capital_stack_items").insert({
    deal_id: dealId,
    tier,
    source,
    amount,
    terms: terms as never,
    order_index: nextIndex,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/command-dashboard/${dealId}`);
}

export async function deleteCapitalItemAction(dealId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("capital_stack_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath(`/command-dashboard/${dealId}`);
}

// === UCC FILINGS ===

export async function addUccFilingAction(dealId: string, formData: FormData) {
  const supabase = await createClient();

  const filing_state = String(formData.get("filing_state") ?? "").trim().toUpperCase();
  const debtor = String(formData.get("debtor") ?? "").trim();
  const secured_party = String(formData.get("secured_party") ?? "").trim();
  const collateral_description =
    String(formData.get("collateral_description") ?? "").trim() || null;

  if (!filing_state) throw new Error("Filing state is required");
  if (!debtor) throw new Error("Debtor is required");
  if (!secured_party) throw new Error("Secured party is required");

  const { error } = await supabase.from("ucc_filings").insert({
    deal_id: dealId,
    filing_state,
    debtor,
    secured_party,
    collateral_description,
    status: "draft",
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/command-dashboard/${dealId}`);
  revalidatePath("/ucc-wealth-engine");
}

export async function setUccStatusAction(
  dealId: string,
  filingId: string,
  status: UccStatus,
  filingNumber?: string
) {
  if (!VALID_UCC_STATUSES.includes(status)) throw new Error("Invalid UCC status");
  const supabase = await createClient();

  const update: {
    status: UccStatus;
    filed_at?: string;
    filing_number?: string;
  } = { status };
  if (status === "filed") {
    update.filed_at = new Date().toISOString();
    if (filingNumber) update.filing_number = filingNumber;
  }

  const { error } = await supabase.from("ucc_filings").update(update).eq("id", filingId);
  if (error) throw new Error(error.message);

  revalidatePath(`/command-dashboard/${dealId}`);
  revalidatePath("/ucc-wealth-engine");
}

export async function deleteUccFilingAction(dealId: string, filingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("ucc_filings").delete().eq("id", filingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/command-dashboard/${dealId}`);
  revalidatePath("/ucc-wealth-engine");
}
