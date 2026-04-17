"use client";

import { useState } from "react";

export default function OutputBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="rounded-lg border border-white/15 bg-white/[0.05] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-white/40">Generated</div>
        <button
          type="button"
          onClick={copy}
          className="text-xs text-white/70 hover:text-white border border-white/15 rounded px-2 py-1 transition"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="text-white/90 whitespace-pre-wrap leading-relaxed">{text}</div>
      <p className="text-xs text-white/40 mt-4">Saved to your library.</p>
    </div>
  );
}
