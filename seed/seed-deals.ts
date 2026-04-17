import { adminClient, log } from "./_common";

export async function seedDeals(founderIds: string[]) {
  if (founderIds.length === 0) {
    log("deals", "no founder ids — skipping");
    return;
  }
  const db = adminClient();
  const ownerId = founderIds[0];

  const deals = [
    {
      owner_user_id: ownerId,
      name: "Meridian Logistics Roll-Up",
      target_entity: "Meridian Logistics LLC",
      phase: "phase_2" as const,
      status: "active" as const,
      estimated_value: 2400000,
      notes: "Regional trucking operator; founder retiring. Seller financing likely.",
      oocemr_analysis: {
        opportunity: "Established regional carrier with 18 active contracts",
        ownership: "Sole-owner LLC, unencumbered",
        collateral: "12 tractors, 18 trailers, customer contracts",
        encumbrances: "Equipment loan ~$340k, no other liens",
        margin: "Cash flow ~$600k annually; asking 4x",
        risk: "Driver retention, fuel cost exposure",
      },
      is_mock: true,
    },
    {
      owner_user_id: ownerId,
      name: "Cascade Property Note Acquisition",
      target_entity: "Cascade Holdings LLC",
      phase: "phase_1" as const,
      status: "active" as const,
      estimated_value: 850000,
      notes: "Performing mortgage note purchase — diligence in progress.",
      oocemr_analysis: {},
      is_mock: true,
    },
  ];

  const { data, error } = await db.from("deals").insert(deals).select("id");
  if (error) throw error;
  if (!data) return;

  // Capital stack for the first deal
  const stack = [
    {
      deal_id: data[0].id,
      tier: "senior_debt" as const,
      source: "Community bank SBA 7(a)",
      amount: 1600000,
      terms: { rate: "Prime + 2.75%", term_months: 120 },
      order_index: 0,
      is_mock: true,
    },
    {
      deal_id: data[0].id,
      tier: "seller_financing" as const,
      source: "Previous owner — subordinated note",
      amount: 500000,
      terms: { rate: "6%", term_months: 60, interest_only: true },
      order_index: 1,
      is_mock: true,
    },
    {
      deal_id: data[0].id,
      tier: "equity" as const,
      source: "Sponsor equity",
      amount: 300000,
      terms: {},
      order_index: 2,
      is_mock: true,
    },
  ];

  const { error: stackErr } = await db.from("capital_stack_items").insert(stack);
  if (stackErr) throw stackErr;

  // UCC filing draft for the first deal
  const { error: uccErr } = await db.from("ucc_filings").insert([
    {
      deal_id: data[0].id,
      filing_state: "TX",
      debtor: "Meridian Logistics LLC",
      secured_party: "BPIS Acquisition SPV I, LLC",
      collateral_description: "All assets, including but not limited to equipment, accounts, and contract rights.",
      status: "draft" as const,
      is_mock: true,
    },
  ]);
  if (uccErr) throw uccErr;

  log("deals", `seeded ${deals.length} deals with capital stack + UCC draft`);
}
