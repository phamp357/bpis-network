import { adminClient, log } from "./_common";

export async function seedPartners() {
  const db = adminClient();
  const partners = [
    {
      type: "iul_advisor" as const,
      full_name: "Jamal Thornton",
      company: "Covenant Wealth Advisors",
      email: "jthornton@example.com",
      phone: "555-0134",
      license_number: "TX-IUL-4421",
      license_state: "TX",
      vetting_status: "approved" as const,
      vetting_notes: "10+ years structuring IULs. Clean compliance record.",
      is_mock: true,
    },
    {
      type: "iul_advisor" as const,
      full_name: "Sabrina Okonkwo",
      company: "Legacy Structured Life",
      email: "sabrina@example.com",
      license_state: "GA",
      vetting_status: "in_review" as const,
      is_mock: true,
    },
    {
      type: "legal" as const,
      full_name: "Marcus Haywood, Esq.",
      company: "Haywood Legal Group",
      email: "mhaywood@example.com",
      license_state: "TX",
      vetting_status: "approved" as const,
      vetting_notes: "UCC-1 specialist; drafts and files across TX/GA/FL.",
      is_mock: true,
    },
  ];

  const { error } = await db.from("partners").insert(partners);
  if (error) throw error;
  log("partners", `seeded ${partners.length} partners`);
}
