"use client";

import Link from "next/link";

export default function PrintControls({ backHref }: { backHref: string }) {
  return (
    <div className="border-b border-neutral-200 px-6 py-3 flex items-center justify-between text-sm print:hidden">
      <Link href={backHref} className="text-neutral-600 hover:text-black">
        ← Back to deal
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md bg-black text-white px-4 py-1.5 hover:bg-neutral-800"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
