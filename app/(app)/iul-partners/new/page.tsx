import Link from "next/link";
import CreatePartnerForm from "./CreatePartnerForm";

export default function NewPartnerPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2">
        <Link href="/iul-partners" className="text-sm text-white/50 hover:text-white/80">
          ← Back to partners
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Add partner</h1>
        <p className="text-white/60 mt-2">
          Partner records live across all clients. Vet once, reuse forever.
        </p>
      </div>

      <CreatePartnerForm />
    </div>
  );
}
