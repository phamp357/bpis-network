import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PackageSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const supabase = await createClient();

  // Look up the purchase by session id. The webhook is the source of truth
  // for status — this page reads whatever the webhook wrote.
  const { data: purchase } = session_id
    ? await supabase
        .from("purchases")
        .select("id, package_id, status, amount_cents, currency")
        .eq("stripe_checkout_session_id", session_id)
        .maybeSingle()
    : { data: null };

  const { data: pkg } = purchase?.package_id
    ? await supabase
        .from("packages")
        .select("name, description")
        .eq("id", purchase.package_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <h1 className="text-2xl font-semibold">Thank you</h1>
        <p className="text-white/70 mt-2">
          {pkg ? <>Your {pkg.name} purchase is complete.</> : "Your purchase is complete."}
        </p>
        {purchase?.status === "pending" && (
          <p className="text-xs text-white/50 mt-4">
            Payment confirmation may take a few seconds to process. You can close this page —
            we&apos;ll send a receipt to your email.
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <Link href="/dashboard" className="text-white/70 hover:text-white">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
