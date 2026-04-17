"use client";

import { useState, useTransition } from "react";
import { runOocemrAnalysisAction } from "../actions";

type Analysis = {
  opportunity?: string;
  ownership?: string;
  collateral?: string;
  encumbrances?: string;
  margin?: string;
  risk?: string;
  confidence_score?: number;
  red_flags?: string[];
  generated_at?: string;
} | null;

const DIMENSIONS: Array<{ key: keyof NonNullable<Analysis>; label: string }> = [
  { key: "opportunity", label: "Opportunity" },
  { key: "ownership", label: "Ownership" },
  { key: "collateral", label: "Collateral" },
  { key: "encumbrances", label: "Encumbrances" },
  { key: "margin", label: "Margin" },
  { key: "risk", label: "Risk" },
];

export default function OocemrAnalysis({
  dealId,
  analysis,
}: {
  dealId: string;
  analysis: Analysis;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Does the object have any of the 6 dimensions filled in?
  const hasAnalysis = !!analysis && DIMENSIONS.some((d) => typeof analysis[d.key] === "string" && (analysis[d.key] as string).length > 0);

  function onRun() {
    setError(null);
    startTransition(async () => {
      try {
        await runOocemrAnalysisAction(dealId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      }
    });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            OOCEMR analysis
          </div>
          <div className="text-sm text-white/60 mt-0.5">
            Claude Opus 4.7 • Opportunity / Ownership / Collateral / Encumbrances / Margin / Risk
          </div>
        </div>
        <button
          type="button"
          onClick={onRun}
          disabled={isPending}
          className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15 disabled:opacity-60"
        >
          {isPending ? "Analyzing…" : hasAnalysis ? "Re-run analysis" : "Run analysis"}
        </button>
      </div>

      {error && (
        <div className="mx-5 my-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasAnalysis && !isPending && !error && (
        <div className="px-5 py-8 text-center text-sm text-white/50">
          No analysis yet. Opus 4.7 reads the deal, capital stack, and UCC filings to produce
          a structured OOCEMR brief with a confidence score and red flags. Takes ~15-30 seconds.
        </div>
      )}

      {isPending && !hasAnalysis && (
        <div className="px-5 py-8 text-center text-sm text-white/50">
          Opus is thinking — this may take 15-30 seconds…
        </div>
      )}

      {hasAnalysis && analysis && (
        <div className="p-5 space-y-5">
          {/* Score + flags header */}
          {(analysis.confidence_score != null || (analysis.red_flags && analysis.red_flags.length > 0)) && (
            <div className="flex items-start justify-between gap-6 pb-5 border-b border-white/10">
              {analysis.confidence_score != null && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/40 mb-1">
                    Data confidence
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold">{analysis.confidence_score}</span>
                    <span className="text-white/40 text-sm">/ 100</span>
                  </div>
                </div>
              )}

              {analysis.red_flags && analysis.red_flags.length > 0 && (
                <div className="flex-1 max-w-md">
                  <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    Red flags
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.red_flags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-sm text-red-200/90 flex gap-2 items-start"
                      >
                        <span className="text-red-400 mt-0.5">▲</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Six dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DIMENSIONS.map((d) => {
              const text = analysis[d.key] as string | undefined;
              if (!text) return null;
              return (
                <div key={d.key} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-wider text-white/40 mb-2">
                    {d.label}
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>

          {analysis.generated_at && (
            <div className="text-xs text-white/40 pt-2 border-t border-white/10">
              Generated {new Date(analysis.generated_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
