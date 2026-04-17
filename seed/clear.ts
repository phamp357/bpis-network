import { assertNotProd, adminClient, log } from "./_common";

// Removes every row tagged is_mock=true across all tables.
// Order matters — delete children before parents to avoid FK violations.
const ORDERED_TABLES = [
  "events",
  "ucc_filings",
  "capital_stack_items",
  "deals",
  "recommendations",
  "assessments",
  "partner_engagements",
  "partners",
  "content_assets",
  "knowledge_articles",
  "organizations",
] as const;

async function main() {
  const env = assertNotProd();
  log("clear", `running against APP_ENV=${env}`);

  const db = adminClient();

  for (const table of ORDERED_TABLES) {
    const { error, count } = await db
      .from(table)
      .delete({ count: "exact" })
      .eq("is_mock", true);
    if (error) {
      console.error(`[clear] ${table}: ${error.message}`);
      throw error;
    }
    log("clear", `${table}: removed ${count ?? 0} mock rows`);
  }

  // Mock users — delete from public.users first; cascade handles org/etc.
  // Then delete their auth.users rows via admin API.
  const { data: mockUsers, error: fetchErr } = await db
    .from("users")
    .select("id, email")
    .eq("is_mock", true);
  if (fetchErr) throw fetchErr;

  for (const u of mockUsers ?? []) {
    const { error: authDelErr } = await db.auth.admin.deleteUser(u.id);
    if (authDelErr) {
      console.error(`[clear] auth user ${u.email}: ${authDelErr.message}`);
    }
  }
  log("clear", `auth + public users: removed ${mockUsers?.length ?? 0}`);

  log("clear", "done");
}

main().catch((err) => {
  console.error("[clear] FAILED");
  console.error(err);
  process.exit(1);
});
