"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PartnerType = "iul_advisor" | "legal" | "cpa" | "broker" | "other";
type VettingStatus = "pending" | "in_review" | "approved" | "rejected";

const VALID_TYPES: PartnerType[] = ["iul_advisor", "legal", "cpa", "broker", "other"];
const VALID_STATUSES: VettingStatus[] = ["pending", "in_review", "approved", "rejected"];

function collect(formData: FormData) {
  const type = String(formData.get("type") ?? "").trim();
  const full_name = String(formData.get("full_name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const license_number = String(formData.get("license_number") ?? "").trim() || null;
  const license_state =
    String(formData.get("license_state") ?? "").trim().toUpperCase() || null;
  const vetting_status = String(formData.get("vetting_status") ?? "pending").trim();
  const vetting_notes = String(formData.get("vetting_notes") ?? "").trim() || null;

  if (!full_name) throw new Error("Full name is required");
  if (!VALID_TYPES.includes(type as PartnerType)) throw new Error("Invalid partner type");
  if (!VALID_STATUSES.includes(vetting_status as VettingStatus)) {
    throw new Error("Invalid vetting status");
  }

  return {
    type: type as PartnerType,
    full_name,
    company,
    email,
    phone,
    license_number,
    license_state,
    vetting_status: vetting_status as VettingStatus,
    vetting_notes,
  };
}

export async function createPartnerAction(formData: FormData) {
  const supabase = await createClient();
  const values = collect(formData);

  const { data, error } = await supabase
    .from("partners")
    .insert(values)
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create partner");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "partner.created",
      entity_type: "partners",
      entity_id: data.id,
      payload: { type: values.type, name: values.full_name },
    });
  }

  revalidatePath("/iul-partners");
  redirect(`/iul-partners/${data.id}`);
}

export async function updatePartnerAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = collect(formData);

  const { error } = await supabase.from("partners").update(values).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/iul-partners");
  revalidatePath(`/iul-partners/${id}`);
  redirect(`/iul-partners/${id}`);
}

export async function setVettingStatusAction(id: string, status: VettingStatus) {
  const supabase = await createClient();
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");

  const { error } = await supabase
    .from("partners")
    .update({ vetting_status: status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "partner.vetting_status_changed",
      entity_type: "partners",
      entity_id: id,
      payload: { status },
    });
  }

  revalidatePath("/iul-partners");
  revalidatePath(`/iul-partners/${id}`);
}

export async function deletePartnerAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/iul-partners");
  redirect("/iul-partners");
}
