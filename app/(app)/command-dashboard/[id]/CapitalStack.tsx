"use client";

import { useState, useTransition } from "react";
import {
  addCapitalItemAction,
  deleteCapitalItemAction,
} from "../actions";
import { CAPITAL_TIERS, TIER_STYLES, formatCurrency, tierLabel } from "@/lib/deals";

type Item = {
  id: string;
  tier: string;
  source: string;
  amount: number | null;
  terms: unknown;
  order_index: number;
};

export default function CapitalStack({
  dealId,
  items,
}: {
  dealId: string;
  items: Item[];
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = items.reduce((sum, i) => sum + Number(i.amount ?? 0), 0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await addCapitalItemAction(dealId, formData);
        form.reset();
        setAdding(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add item");
      }
    });
  }

  function onDelete(itemId: string) {
    if (!confirm("Remove this capital stack item?")) return;
    startTransition(async () => {
      await deleteCapitalItemAction(dealId, itemId);
    });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            Capital stack
          </div>
          <div className="text-sm text-white/60 mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"} • Total{" "}
            {formatCurrency(total)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15"
        >
          {adding ? "Cancel" : "+ Add item"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={onSubmit}
          className="p-5 border-b border-white/10 space-y-4 bg-black/20"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Tier</label>
            <div className="flex gap-2 flex-wrap">
              {CAPITAL_TIERS.map((t, i) => (
                <label
                  key={t.value}
                  className="cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.value}
                    defaultChecked={i === 0}
                    required
                    disabled={isPending}
                    className="sr-only"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Source <span className="text-red-300">*</span>
              </label>
              <input
                type="text"
                name="source"
                required
                disabled={isPending}
                placeholder="e.g., Community bank SBA 7(a)"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount <span className="text-red-300">*</span>
              </label>
              <input
                type="text"
                name="amount"
                required
                disabled={isPending}
                inputMode="numeric"
                placeholder="1600000"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rate (optional)</label>
              <input
                type="text"
                name="rate"
                disabled={isPending}
                placeholder="Prime + 2.75%"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Term in months (optional)
              </label>
              <input
                type="number"
                name="term_months"
                min={0}
                disabled={isPending}
                placeholder="120"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-white text-black font-medium px-4 py-1.5 text-sm hover:bg-white/90 disabled:opacity-60 transition"
            >
              {isPending ? "Adding…" : "Add to stack"}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && !adding && (
        <div className="px-5 py-8 text-center text-sm text-white/50">
          No capital stack items yet.
        </div>
      )}

      {items.length > 0 && (
        <ul className="divide-y divide-white/10">
          {items.map((item) => {
            const terms = (item.terms ?? {}) as { rate?: string; term_months?: number };
            return (
              <li key={item.id} className="px-5 py-3 flex items-center gap-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${TIER_STYLES[item.tier] ?? ""}`}
                >
                  {tierLabel(item.tier)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{item.source}</div>
                  {(terms.rate || terms.term_months) && (
                    <div className="text-xs text-white/50">
                      {terms.rate && <span>{terms.rate}</span>}
                      {terms.rate && terms.term_months ? " · " : ""}
                      {terms.term_months && <span>{terms.term_months} months</span>}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-white/90 shrink-0">
                  {formatCurrency(Number(item.amount))}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  disabled={isPending}
                  className="text-xs text-white/40 hover:text-red-300 shrink-0"
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
