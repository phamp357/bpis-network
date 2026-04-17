// Usage:
//   npm run promote -- user@example.com
//
// Promotes the given email to role='operator'.
// Handles three cases:
//   A) public.users row exists → just update role
//   B) auth.users exists but public.users doesn't → backfill profile row, set role
//   C) neither exists → create auth user + profile row with operator role
// Always safe to re-run.

import { adminClient } from "../seed/_common";

async function findAuthUserByEmail(
  db: ReturnType<typeof adminClient>,
  email: string
): Promise<string | null> {
  // Paginate through auth users — small user count, fine to scan
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found.id;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run promote -- user@example.com");
    process.exit(1);
  }

  const db = adminClient();

  // A) public.users already has them — simplest path
  const { data: existing, error: selErr } = await db
    .from("users")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const { error } = await db
      .from("users")
      .update({ role: "operator" })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`[promote] updated existing profile → ${email} role=operator (id=${existing.id})`);
    return;
  }

  // B) auth.users has them but public.users doesn't — backfill
  const existingAuthId = await findAuthUserByEmail(db, email);
  if (existingAuthId) {
    console.log(`[promote] auth user found (${existingAuthId}) — backfilling profile…`);
    const { error } = await db.from("users").insert({
      id: existingAuthId,
      email,
      role: "operator",
    });
    if (error) throw error;
    console.log(`[promote] ${email} → role=operator (id=${existingAuthId})`);
    return;
  }

  // C) Neither exists — create both
  console.log(`[promote] no user found for ${email} — creating auth user…`);
  const { data, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Failed to create auth user");

  // Trigger inserted the public.users row at default role. Update to operator.
  const { error: upErr } = await db
    .from("users")
    .update({ role: "operator" })
    .eq("id", data.user.id);
  if (upErr) throw upErr;

  console.log(`[promote] created + promoted ${email} (id=${data.user.id})`);
}

main().catch((err) => {
  console.error("[promote] FAILED");
  console.error(err);
  process.exit(1);
});
