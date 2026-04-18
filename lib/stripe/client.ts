import Stripe from "stripe";
import { assertStripeEnabled } from "./config";

let _client: Stripe | null = null;

export function stripe(): Stripe {
  assertStripeEnabled();
  if (!_client) {
    _client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Omit apiVersion — the SDK pins to its default. Explicit pin can be
      // added later if we want to lock to a specific Stripe API version.
    });
  }
  return _client;
}
