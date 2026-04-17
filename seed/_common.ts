import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export function assertNotProd() {
  const env = process.env.APP_ENV ?? "dev";
  if (env === "prod") {
    throw new Error(
      `Refusing to run seed scripts against APP_ENV=prod. Set APP_ENV=dev|staging in .env.local.`
    );
  }
  return env;
}

export function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local"
    );
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function log(section: string, msg: string) {
  console.log(`[${section}] ${msg}`);
}
