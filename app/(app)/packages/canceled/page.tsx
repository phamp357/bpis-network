import Link from "next/link";

export default function PackageCanceledPage() {
  return (
    <div className="max-w-xl">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-2xl font-semibold">Checkout canceled</h1>
        <p className="text-white/70 mt-2">No charge was made. You can try again anytime.</p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <Link href="/covenant" className="text-white/70 hover:text-white">
          ← Back to COVENANT
        </Link>
      </div>
    </div>
  );
}
