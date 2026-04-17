import { createClient } from "@/lib/supabase/server";
import SuiteShell from "./SuiteShell";

export default async function IntelligenceSuitePage() {
  const supabase = await createClient();

  const { data: recent } = await supabase
    .from("content_assets")
    .select("id, asset_type, prompt, output, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase 6</div>
        <h1 className="text-3xl font-semibold tracking-tight">Intelligence Suite</h1>
        <p className="text-white/60 mt-2 max-w-xl">
          Three generators in your voice — social posts, objection responses, and prospect intel.
          Powered by Claude Sonnet 4.6.
        </p>
      </div>

      <SuiteShell recent={recent ?? []} />
    </div>
  );
}
