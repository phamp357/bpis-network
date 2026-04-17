// Usage:
//   npm run promote -- user@example.com
//
// Promotes the given email to role='operator'. If the user doesn't exist yet,
// creates an auth user (email-confirmed) so the first magic link sign-in works.
// Always safe to re-run.

import { adminClient } from "../seed/_common";

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run promote -- user@example.com");
    process.exit(1);
  }

  const db = adminClient();

  // Check for existing public.users row
  const { data: existing, error: selErr } = await db
    .from("users")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();
  if (selErr) throw selErr;

  let userId = existing?.id;

  if (!userId) {
    console.log(`[promote] no user found for ${email} — creating auth user…`);
    const { data, error } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Failed to create auth user");
    userId = data.user.id;
    console.log(`[promote] created auth user ${userId}`);
  }

  const { error: upErr } = await db
    .from("users")
    .update({ role: "operator" })
    .eq("id", userId);
  if (upErr) throw upErr;

  console.log(`[promote] ${email} → role=operator (id=${userId})`);
}

main().catch((err) => {
  console.error("[promote] FAILED");
  console.error(err);
  process.exit(1);
});
