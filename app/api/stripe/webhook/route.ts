import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { isStripeEnabled } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe must receive the raw body to verify signatures — Next's built-in
// json parser would break that.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this environment." },
      { status: 503 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const purchaseId =
          session.client_reference_id ?? (session.metadata?.purchase_id ?? null);
        if (!purchaseId) break;

        await admin
          .from("purchases")
          .update({
            status: "paid",
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : null,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            amount_cents: session.amount_total ?? null,
            currency: session.currency ?? "usd",
          })
          .eq("id", purchaseId);

        const userId = session.metadata?.user_id ?? null;
        if (userId) {
          await admin.from("events").insert({
            user_id: userId,
            event_type: "purchase.paid",
            entity_type: "purchases",
            entity_id: purchaseId,
            payload: {
              session_id: session.id,
              amount_cents: session.amount_total,
            },
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const purchaseId =
          session.client_reference_id ?? (session.metadata?.purchase_id ?? null);
        if (purchaseId) {
          await admin
            .from("purchases")
            .update({ status: "canceled" })
            .eq("id", purchaseId)
            .eq("status", "pending");
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (pi) {
          await admin
            .from("purchases")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", pi);
        }
        break;
      }

      default:
        // Ignore events we don't care about. Still 200 so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
