import Link from "next/link";
import NewDealForm from "./NewDealForm";

export default function NewDealPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2">
        <Link href="/command-dashboard" className="text-sm text-white/50 hover:text-white/80">
          ← Back to dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">New deal</h1>
        <p className="text-white/60 mt-2">
          Capture the essentials. You can add capital stack items and UCC filings on the deal page.
        </p>
      </div>

      <NewDealForm />
    </div>
  );
}
