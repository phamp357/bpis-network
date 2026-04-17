import { createClient } from "@supabase/supabase-js";

// Server-only — uses the Supabase secret key. Bypasses RLS. Never import from client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
