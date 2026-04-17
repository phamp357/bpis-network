import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Server-only — uses the Supabase secret key. Bypasses RLS. Never import from client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
