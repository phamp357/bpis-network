"use client";

import { useState, useTransition } from "react";
import { createDealAction } from "../actions";
import { DEAL_PHASES } from "@/lib/deals";

export default function NewDealForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createDealAction(formData);
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
      <div>
        <label className="block text-sm font-medium mb-1">
          Deal name <span className="text-red-300">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          disabled={isPending}
          placeholder="e.g., Meridian Logistics Roll-Up"
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Target entity</label>
        <input
          type="text"
          name="target_entity"
          disabled={isPending}
          placeholder="e.g., Meridian Logistics LLC"
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estimated value</label>
        <p className="text-xs text-white/50 mb-2">Total deal size in USD.</p>
        <input
          type="text"
          name="estimated_value"
          disabled={isPending}
          placeholder="2400000"
          inputMode="numeric"
          className="w-48 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Starting phase</label>
        <div className="flex gap-2 flex-wrap">
          {DEAL_PHASES.map((p, i) => (
            <label
              key={p.value}
              className="cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
            >
              <input
                type="radio"
                name="phase"
                value={p.value}
                defaultChecked={i === 0}
                disabled={isPending}
                className="sr-only"
              />
              {p.short} — {p.label.split("—")[1]?.trim()}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={4}
          disabled={isPending}
          placeholder="Context, seller motivation, diligence findings, anything worth remembering…"
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-white text-black font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Saving…" : "Create deal"}
        </button>
      </div>
    </form>
  );
}
