// Stripe is "gated" until the secret key is present. This lets us ship the
// infrastructure without live payments — every touch point checks isStripeEnabled()
// first so the UI can show "Coming soon" cleanly.

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
}

export function assertStripeEnabled() {
  if (!isStripeEnabled()) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable payments."
    );
  }
}

// URLs used by Checkout session creation. Set NEXT_PUBLIC_APP_URL in prod,
// falls back to localhost in dev.
export function appUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
