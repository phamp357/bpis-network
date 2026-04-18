import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { appUrl, isStripeEnabled } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this environment." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { package_id?: string } | null;
  const packageId = body?.package_id;
  if (!packageId) {
    return NextResponse.json({ error: "package_id required" }, { status: 400 });
  }

  // Look up the package. Use admin client so we can read stripe_price_id
  // regardless of RLS policy changes later.
  const admin = createAdminClient();
  const { data: pkg, error: pkgErr } = await admin
    .from("packages")
    .select("id, name, stripe_price_id")
    .eq("id", packageId)
    .eq("active", true)
    .maybeSingle();
  if (pkgErr) return NextResponse.json({ error: pkgErr.message }, { status: 500 });
  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  if (!pkg.stripe_price_id) {
    return NextResponse.json(
      { error: "This package has no Stripe price configured yet." },
      { status: 409 }
    );
  }

  // Create a pending purchase record first so we can correlate on webhook.
  const { data: purchase, error: purchaseErr } = await admin
    .from("purchases")
    .insert({
      user_id: user.id,
      package_id: pkg.id,
      status: "pending",
      metadata: { package_name: pkg.name } as never,
    })
    .select("id")
    .single();
  if (purchaseErr || !purchase) {
    return NextResponse.json(
      { error: purchaseErr?.message ?? "Failed to create purchase" },
      { status: 500 }
    );
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: pkg.stripe_price_id, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: purchase.id,
    metadata: {
      user_id: user.id,
      package_id: pkg.id,
      purchase_id: purchase.id,
    },
    success_url: appUrl(`/packages/success?session_id={CHECKOUT_SESSION_ID}`),
    cancel_url: appUrl(`/packages/canceled?purchase_id=${purchase.id}`),
  });

  // Save the session id on the pending purchase for later lookup.
  await admin
    .from("purchases")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", purchase.id);

  return NextResponse.json({ url: session.url });
}
