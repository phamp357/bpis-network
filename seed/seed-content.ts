import { adminClient, log } from "./_common";

export async function seedContent(founderIds: string[]) {
  if (founderIds.length === 0) {
    log("content", "no founder ids — skipping");
    return;
  }
  const db = adminClient();

  const rows = [
    {
      user_id: founderIds[0],
      asset_type: "social_post" as const,
      prompt: "Write a LinkedIn post about the discipline-capacity tradeoff in Kingdom-centered business.",
      output:
        "Discipline without capacity burns you out. Capacity without discipline ruins you. Kingdom-centered business is the deliberate cultivation of both — first in the founder, then in the system. That's the order.",
      brand_voice_snapshot: { tone: "direct, reflective", audience: "Kingdom entrepreneurs" },
      published: false,
      is_mock: true,
    },
    {
      user_id: founderIds[0],
      asset_type: "objection_response" as const,
      prompt: "Prospect says: 'I can't afford the Sovereign package right now.'",
      output:
        "Understood. Two questions: (1) is this a cashflow timing issue or a structural one? (2) what's the cost of doing this wrong in year two? If it's timing, we can stage it. If it's structural, Essential gets you protected today.",
      brand_voice_snapshot: { tone: "direct, diagnostic", audience: "prospective clients" },
      published: false,
      is_mock: true,
    },
  ];

  const { error } = await db.from("content_assets").insert(rows);
  if (error) throw error;
  log("content", `seeded ${rows.length} content assets`);
}
