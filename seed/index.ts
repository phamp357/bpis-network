import { assertNotProd, log } from "./_common";
import { seedPackages } from "./seed-packages";
import { seedKnowledge } from "./seed-knowledge";
import { seedUsers } from "./seed-users";
import { seedDeals } from "./seed-deals";
import { seedPartners } from "./seed-partners";
import { seedAssessments } from "./seed-assessments";
import { seedContent } from "./seed-content";

async function main() {
  const env = assertNotProd();
  log("seed", `running against APP_ENV=${env}`);

  // Reference data (safe to run repeatedly — upserts)
  await seedPackages();
  await seedKnowledge();

  // Mock data
  const users = await seedUsers();
  const founderIds = users.filter((u) => u.role === "founder").map((u) => u.id);
  await seedPartners();
  await seedAssessments(founderIds);
  await seedDeals(founderIds);
  await seedContent(founderIds);

  log("seed", "done");
}

main().catch((err) => {
  console.error("[seed] FAILED");
  console.error(err);
  process.exit(1);
});
