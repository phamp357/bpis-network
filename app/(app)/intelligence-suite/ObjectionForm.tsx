"use client";

import { useState, useTransition } from "react";
import { runObjectionAction } from "./actions";
import OutputBlock from "./OutputBlock";

export default function ObjectionForm() {
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const { output } = await runObjectionAction(formData);
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
        <div>
          <label className="block text-sm font-medium mb-1">Objection</label>
          <p className="text-xs text-white/50 mb-2">What did the prospect say, verbatim?</p>
          <textarea
            name="objection"
            required
            rows={3}
            disabled={isPending}
            placeholder={`e.g., "I can't afford the Sovereign package right now."`}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Context (optional)</label>
          <p className="text-xs text-white/50 mb-2">
            Who are they, what product, where are they in the funnel?
          </p>
          <input
            type="text"
            name="context"
            disabled={isPending}
            placeholder="e.g., discovery call, early-stage founder, eval COVENANT Sovereign"
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
            {isPending ? "Generating…" : "Generate response"}
          </button>
        </div>
      </form>

      {output && <OutputBlock text={output} />}
    </div>
  );
}
