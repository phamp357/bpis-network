import Link from "next/link";
import { COVENANT_QUESTIONS } from "@/lib/claude/covenant";
import CovenantForm from "./CovenantForm";

export default function NewCovenantPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2">
        <Link href="/covenant" className="text-sm text-white/50 hover:text-white/80">
          ← Back to assessments
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">New COVENANT assessment</h1>
        <p className="text-white/60 mt-2">
          Six questions. COVENANT returns a package recommendation — Essential, Builder,
          or Sovereign — with confidence score and strategy notes.
        </p>
      </div>

      <CovenantForm questions={COVENANT_QUESTIONS} />
    </div>
  );
}
