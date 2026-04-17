// Deal/capital-stack/UCC metadata and helpers.

export const DEAL_PHASES = [
  { value: "phase_1", label: "Phase 1 — Identify", short: "P1" },
  { value: "phase_2", label: "Phase 2 — Diligence", short: "P2" },
  { value: "phase_3", label: "Phase 3 — Structure", short: "P3" },
  { value: "phase_4", label: "Phase 4 — Close", short: "P4" },
  { value: "phase_5", label: "Phase 5 — Operate", short: "P5" },
] as const;

export const DEAL_STATUSES = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
] as const;

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  paused: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  closed: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  dead: "bg-white/5 text-white/50 border-white/15",
};

export const CAPITAL_TIERS = [
  { value: "senior_debt", label: "Senior debt" },
  { value: "mezzanine", label: "Mezzanine" },
  { value: "ucc_secured", label: "UCC-secured" },
  { value: "seller_financing", label: "Seller financing" },
  { value: "equity", label: "Equity" },
] as const;

export const TIER_STYLES: Record<string, string> = {
  senior_debt: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  mezzanine: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  ucc_secured: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  seller_financing: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  equity: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
};

export const UCC_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "filed", label: "Filed" },
  { value: "amended", label: "Amended" },
  { value: "terminated", label: "Terminated" },
] as const;

export const UCC_STATUS_STYLES: Record<string, string> = {
  draft: "bg-white/5 text-white/70 border-white/15",
  filed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  amended: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  terminated: "bg-red-500/10 text-red-300 border-red-500/30",
};

export function phaseLabel(phase: string) {
  return DEAL_PHASES.find((p) => p.value === phase)?.label ?? phase;
}

export function phaseShort(phase: string) {
  return DEAL_PHASES.find((p) => p.value === phase)?.short ?? phase;
}

export function statusLabel(status: string) {
  return DEAL_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function tierLabel(tier: string) {
  return CAPITAL_TIERS.find((t) => t.value === tier)?.label ?? tier;
}

export function uccStatusLabel(status: string) {
  return UCC_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
