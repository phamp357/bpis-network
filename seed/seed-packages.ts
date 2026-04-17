import { adminClient, log } from "./_common";

// Packages are reference data, not mock data — but we still tag them in case
// you want to clear and reseed. Change is_mock to false for production-ready rows.
export async function seedPackages() {
  const db = adminClient();
  const rows = [
    {
      code: "essential" as const,
      name: "COVENANT Essential",
      description:
        "Foundational legal formation package for early-stage Kingdom entrepreneurs.",
      price: 1497,
      features: [
        "LLC / entity formation",
        "Operating agreement template",
        "EIN registration guidance",
        "Basic compliance checklist",
      ],
      active: true,
    },
    {
      code: "builder" as const,
      name: "COVENANT Builder",
      description:
        "For businesses scaling past initial formation — adds contracts, IP, and team structuring.",
      price: 4997,
      features: [
        "Everything in Essential",
        "Contract template library",
        "IP assignment + NDA templates",
        "Contractor vs employee framework",
        "Quarterly compliance review",
      ],
      active: true,
    },
    {
      code: "sovereign" as const,
      name: "COVENANT Sovereign",
      description:
        "Full-stack legal and wealth architecture — includes UCC strategy, trust structure, and legacy planning.",
      price: 14997,
      features: [
        "Everything in Builder",
        "UCC-1 filing strategy consultation",
        "Revocable living trust setup",
        "Asset protection structure",
        "Dedicated legal strategist access",
      ],
      active: true,
    },
  ];

  const { error } = await db
    .from("packages")
    .upsert(rows, { onConflict: "code", ignoreDuplicates: false });
  if (error) throw error;
  log("packages", `upserted ${rows.length} packages`);
}
