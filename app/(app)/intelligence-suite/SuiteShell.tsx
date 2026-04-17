"use client";

import { useState } from "react";
import { GENERATOR_LABELS, type GeneratorType } from "@/lib/claude/intelligence";
import SocialForm from "./SocialForm";
import ObjectionForm from "./ObjectionForm";
import ProspectForm from "./ProspectForm";

type RecentAsset = {
  id: string;
  asset_type: string;
  prompt: string;
  output: string;
  created_at: string;
};

const TABS: GeneratorType[] = ["social_post", "objection_response", "prospect_intel"];

export default function SuiteShell({ recent }: { recent: RecentAsset[] }) {
  const [active, setActive] = useState<GeneratorType>("social_post");

  const filteredRecent = recent.filter((r) => r.asset_type === active);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {TABS.map((type) => {
          const isActive = type === active;
          return (
            <button
              key={type}
              onClick={() => setActive(type)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
                isActive
                  ? "border-white text-white"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {GENERATOR_LABELS[type].name}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-white/60 mb-6">{GENERATOR_LABELS[active].description}</p>

      {/* Active form */}
      <div className="mb-10">
        {active === "social_post" && <SocialForm />}
        {active === "objection_response" && <ObjectionForm />}
        {active === "prospect_intel" && <ProspectForm />}
      </div>

      {/* Recent for this tab */}
      {filteredRecent.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Recent {GENERATOR_LABELS[active].name.toLowerCase()}s
          </h2>
          <ul className="space-y-3">
            {filteredRecent.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="text-xs text-white/40 truncate">{r.prompt}</div>
                  <div className="text-xs text-white/40 shrink-0">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-white/85 whitespace-pre-wrap">{r.output}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
