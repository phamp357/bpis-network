// Shared partner type/status metadata for UI rendering.

export const PARTNER_TYPES = [
  { value: "iul_advisor", label: "IUL Advisor" },
  { value: "legal", label: "Legal" },
  { value: "cpa", label: "CPA" },
  { value: "broker", label: "Broker" },
  { value: "other", label: "Other" },
] as const;

export const VETTING_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export const VETTING_STYLES: Record<string, string> = {
  pending: "bg-white/5 text-white/70 border-white/15",
  in_review: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-300 border-red-500/30",
};

export const TYPE_STYLES: Record<string, string> = {
  iul_advisor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  legal: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  cpa: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  broker: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  other: "bg-white/5 text-white/70 border-white/15",
};

export function typeLabel(type: string) {
  return PARTNER_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function vettingLabel(status: string) {
  return VETTING_STATUSES.find((s) => s.value === status)?.label ?? status;
}
