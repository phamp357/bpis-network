import { adminClient, log } from "./_common";

// Creates mock users via the Supabase admin API. These get real auth.users rows
// and corresponding public.users rows (via the signup trigger).
// They are tagged is_mock=true so the clear script can remove them cleanly.
export async function seedUsers() {
  const db = adminClient();

  const mocks = [
    {
      email: "mock.founder.alpha@example.com",
      full_name: "Alpha Mockson",
      role: "founder" as const,
    },
    {
      email: "mock.founder.bravo@example.com",
      full_name: "Bravo Mockson",
      role: "founder" as const,
    },
    {
      email: "mock.partner.iul@example.com",
      full_name: "Casey Advisormock",
      role: "partner_iul" as const,
    },
  ];

  const createdIds: { id: string; email: string; role: string }[] = [];

  for (const u of mocks) {
    // Check if user already exists
    const { data: existing } = await db
      .from("users")
      .select("id, email, role")
      .eq("email", u.email)
      .maybeSingle();

    if (existing) {
      createdIds.push(existing);
      continue;
    }

    // Create auth user (auto-confirmed so we don't send a real email)
    const { data: authUser, error: authErr } = await db.auth.admin.createUser({
      email: u.email,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (authErr) throw authErr;
    if (!authUser.user) throw new Error(`Failed to create auth user for ${u.email}`);

    // The on_auth_user_created trigger inserted a row — update it to set
    // role, full_name, and is_mock flag.
    const { error: upErr } = await db
      .from("users")
      .update({
        full_name: u.full_name,
        role: u.role,
        is_mock: true,
      })
      .eq("id", authUser.user.id);
    if (upErr) throw upErr;

    createdIds.push({ id: authUser.user.id, email: u.email, role: u.role });
  }

  log("users", `seeded ${createdIds.length} mock users`);
  return createdIds;
}
