"use client";

import { useState, useTransition } from "react";
import { submitCovenantAssessment } from "../actions";
import type { COVENANT_QUESTIONS } from "@/lib/claude/covenant";

type Questions = typeof COVENANT_QUESTIONS;

export default function CovenantForm({ questions }: { questions: Questions }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await submitCovenantAssessment(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {questions.map((q, i) => (
        <fieldset
          key={q.key}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
        >
          <legend className="text-xs uppercase tracking-wider text-white/40">Q{i + 1}</legend>
          <label htmlFor={q.key} className="block font-medium mb-1">
            {q.label}
          </label>
          {q.helper && <p className="text-sm text-white/50 mb-3">{q.helper}</p>}

          {q.type === "radio" && (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-2 hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
                >
                  <input
                    type="radio"
                    name={q.key}
                    value={opt.value}
                    required
                    disabled={isPending}
                    className="mt-1 accent-white"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "number" && (
            <input
              id={q.key}
              name={q.key}
              type="number"
              min={q.min ?? 0}
              required
              disabled={isPending}
              className="w-32 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          )}

          {q.type === "text" && (
            <input
              id={q.key}
              name={q.key}
              type="text"
              required
              maxLength={q.maxLength}
              placeholder={q.placeholder}
              disabled={isPending}
              className="w-32 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 uppercase focus:outline-none focus:border-white/30"
            />
          )}

          {q.type === "textarea" && (
            <textarea
              id={q.key}
              name={q.key}
              required
              rows={3}
              disabled={isPending}
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
              placeholder="Type your answer…"
            />
          )}
        </fieldset>
      ))}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-white/40">
          {isPending
            ? "COVENANT is analyzing — this may take 10-15 seconds…"
            : "Powered by Claude Sonnet 4.6"}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-white text-black font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Analyzing…" : "Submit for analysis"}
        </button>
      </div>
    </form>
  );
}
