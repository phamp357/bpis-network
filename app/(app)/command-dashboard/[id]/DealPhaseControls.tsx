"use client";

import { useTransition } from "react";
import { setDealPhaseAction, setDealStatusAction } from "../actions";
import { DEAL_PHASES, DEAL_STATUSES } from "@/lib/deals";

type Phase = "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5";
type Status = "active" | "closed" | "dead" | "paused";

export default function DealPhaseControls({
  id,
  phase,
  status,
}: {
  id: string;
  phase: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function setPhase(next: Phase) {
    startTransition(async () => {
      await setDealPhaseAction(id, next);
    });
  }

  function setStatus(next: Status) {
    startTransition(async () => {
      await setDealStatusAction(id, next);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Phase</div>
        <div className="flex gap-1 flex-wrap">
          {DEAL_PHASES.map((p) => {
            const active = p.value === phase;
            return (
              <button
                key={p.value}
                type="button"
                disabled={isPending || active}
                onClick={() => setPhase(p.value)}
                className={`text-sm px-3 py-1.5 rounded-md border transition ${
                  active
                    ? "border-brand bg-brand/15 text-brand cursor-default"
                    : "border-white/10 bg-black/20 text-white/80 hover:border-white/20 disabled:opacity-50"
                }`}
              >
                {p.short}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Status</div>
        <div className="flex gap-1 flex-wrap">
          {DEAL_STATUSES.map((s) => {
            const active = s.value === status;
            return (
              <button
                key={s.value}
                type="button"
                disabled={isPending || active}
                onClick={() => setStatus(s.value)}
                className={`text-sm px-3 py-1.5 rounded-md border transition ${
                  active
                    ? "border-brand bg-brand/15 text-brand cursor-default"
                    : "border-white/10 bg-black/20 text-white/80 hover:border-white/20 disabled:opacity-50"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
