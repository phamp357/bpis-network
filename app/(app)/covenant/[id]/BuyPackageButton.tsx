"use client";

import { useState, useTransition } from "react";

export default function BuyPackageButton({
  packageId,
  stripeEnabled,
  packageName,
  hasStripePrice,
}: {
  packageId: string;
  stripeEnabled: boolean;
  packageName: string;
  hasStripePrice: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onBuy() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ package_id: packageId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Failed to start checkout");
        }
        window.location.href = data.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  // Three states: fully ready, infrastructure-ready-but-price-missing, disabled
  if (!stripeEnabled) {
    return (
      <div className="rounded-md border border-dashed border-white/15 bg-white/[0.02] px-3 py-2 text-xs text-white/50">
        Purchase flow coming soon — {packageName} is ready to wire when you set
        STRIPE_SECRET_KEY.
      </div>
    );
  }

  if (!hasStripePrice) {
    return (
      <div className="rounded-md border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-300/80">
        Stripe is enabled, but {packageName} needs a Stripe price id. Add one to the
        package in Supabase, then refresh.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onBuy}
        disabled={isPending}
        className="rounded-md bg-brand text-brand-fg font-medium px-4 py-2 text-sm hover:bg-brand-hover disabled:opacity-60 transition"
      >
        {isPending ? "Starting checkout…" : `Purchase ${packageName}`}
      </button>
      {error && (
        <div className="text-xs text-red-300">{error}</div>
      )}
    </div>
  );
}
