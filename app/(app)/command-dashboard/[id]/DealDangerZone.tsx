"use client";

import { useTransition } from "react";
import { deleteDealAction } from "../actions";

export default function DealDangerZone({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    if (
      !confirm(
        "Delete this deal? Capital stack items and UCC filings will be removed. This cannot be undone."
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteDealAction(id);
    });
  }

  return (
    <div className="pt-6 border-t border-white/10">
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="text-xs text-red-400/70 hover:text-red-300 disabled:opacity-50"
      >
        Delete deal
      </button>
    </div>
  );
}
