"use client";

import { useTransition } from "react";
import { setVettingStatusAction, deletePartnerAction } from "../actions";
import { VETTING_STATUSES } from "@/lib/partners";

export default function PartnerActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: "pending" | "in_review" | "approved" | "rejected") {
    startTransition(async () => {
      await setVettingStatusAction(id, next);
    });
  }

  function onDelete() {
    if (!confirm("Delete this partner? This cannot be undone.")) return;
    startTransition(async () => {
      await deletePartnerAction(id);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {VETTING_STATUSES.map((s) => {
          const isActive = s.value === status;
          return (
            <button
              key={s.value}
              type="button"
              disabled={isPending || isActive}
              onClick={() => setStatus(s.value)}
              className={`text-sm px-3 py-1.5 rounded-md border transition ${
                isActive
                  ? "border-brand bg-brand/15 text-brand cursor-default"
                  : "border-white/10 bg-black/20 text-white/80 hover:border-white/20 disabled:opacity-50"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="text-xs text-red-400/70 hover:text-red-300 disabled:opacity-50"
      >
        Delete partner
      </button>
    </div>
  );
}
