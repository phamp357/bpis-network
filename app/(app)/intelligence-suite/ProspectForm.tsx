"use client";

import { useState, useTransition } from "react";
import { runProspectIntelAction } from "./actions";
import OutputBlock from "./OutputBlock";

export default function ProspectForm() {
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const { output } = await runProspectIntelAction(formData);
        setOutput(output);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prospect name</label>
            <input
              type="text"
              name="prospect_name"
              required
              disabled={isPending}
              placeholder="Jane Founderson"
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company (optional)</label>
            <input
              type="text"
              name="company"
              disabled={isPending}
              placeholder="Acme Co"
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Known facts (optional)</label>
          <p className="text-xs text-white/50 mb-2">
            Anything you already know — LinkedIn bio, intro context, prior conversations.
          </p>
          <textarea
            name="known_facts"
            rows={4}
            disabled={isPending}
            placeholder="e.g., 8-year e-commerce operator, doing $1.2M, just hired first COO, concerned about tax exposure…"
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Source (optional)</label>
          <input
            type="text"
            name="source"
            disabled={isPending}
            placeholder="e.g., Referred by Marcus H, newsletter signup, podcast guest"
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {isPending ? "Generating…" : "Claude Sonnet 4.6"}
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-brand text-brand-fg font-medium px-5 py-2 hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isPending ? "Generating…" : "Generate brief"}
          </button>
        </div>
      </form>

      {output && <OutputBlock text={output} />}
    </div>
  );
}
