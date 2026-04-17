import Link from "next/link";
import { ORACLE_QUESTIONS } from "@/lib/claude/oracle";
import OracleForm from "./OracleForm";

export default function NewOraclePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2">
        <Link href="/oracle" className="text-sm text-white/50 hover:text-white/80">
          ← Back to assessments
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">New ORACLE assessment</h1>
        <p className="text-white/60 mt-2">
          Seven questions. ORACLE returns a readiness score, tier, and specific next move — usually in under 15 seconds.
        </p>
      </div>

      <OracleForm questions={ORACLE_QUESTIONS} />
    </div>
  );
}
