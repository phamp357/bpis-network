"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateDealAction } from "../actions";

type Deal = {
  id: string;
  name: string;
  target_entity: string | null;
  estimated_value: number | null;
  notes: string | null;
};

export default function DealOverviewEditor({ deal }: { deal: Deal }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateDealAction(deal.id, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-white/10 bg-white/[0.03] p-5 space-y-5"
    >
      <div className="text-xs uppercase tracking-wider text-white/40">Edit overview</div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Deal name <span className="text-red-300">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={deal.name}
          disabled={isPending}
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Target entity</label>
        <input
          type="text"
          name="target_entity"
          defaultValue={deal.target_entity ?? ""}
          disabled={isPending}
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estimated value</label>
        <input
          type="text"
          name="estimated_value"
          defaultValue={deal.estimated_value != null ? String(deal.estimated_value) : ""}
          disabled={isPending}
          inputMode="numeric"
          className="w-48 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={4}
          defaultValue={deal.notes ?? ""}
          disabled={isPending}
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/command-dashboard/${deal.id}`}
          className="text-sm text-white/60 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand text-brand-fg font-medium px-5 py-2 hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
