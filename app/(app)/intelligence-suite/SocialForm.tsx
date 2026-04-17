"use client";

import { useState, useTransition } from "react";
import { runSocialPostAction } from "./actions";
import OutputBlock from "./OutputBlock";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
] as const;

export default function SocialForm() {
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const { output } = await runSocialPostAction(formData);
        setOutput(output);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <p className="text-xs text-white/50 mb-2">What's the post about?</p>
          <textarea
            name="topic"
            required
            rows={3}
            disabled={isPending}
            placeholder="e.g., The discipline-capacity tradeoff when scaling past solo founder…"
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p, i) => (
              <label
                key={p.value}
                className="cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
              >
                <input
                  type="radio"
                  name="platform"
                  value={p.value}
                  defaultChecked={i === 0}
                  required
                  disabled={isPending}
                  className="sr-only"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tone override (optional)</label>
          <input
            type="text"
            name="tone"
            disabled={isPending}
            placeholder="e.g., direct, reflective, punchy"
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
            className="rounded-md bg-white text-black font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isPending ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {output && <OutputBlock text={output} />}
    </div>
  );
}
