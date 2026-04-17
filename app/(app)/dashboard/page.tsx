import { NAV_ITEMS } from "@/lib/nav";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const featureRoutes = NAV_ITEMS.filter((i) => i.href !== "/dashboard");

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-white/60 mt-2">
          Signed in as <span className="text-white">{user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureRoutes.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-white/60 mt-1">{item.description}</div>
              </div>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                Phase {item.phase}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
