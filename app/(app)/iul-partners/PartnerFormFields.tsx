"use client";

import { PARTNER_TYPES, VETTING_STATUSES } from "@/lib/partners";

type Partner = {
  type: string;
  full_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_state: string | null;
  vetting_status: string;
  vetting_notes: string | null;
};

// Shared field layout used by both the create and edit forms.
// Uncontrolled — parent form handles submission.
export default function PartnerFormFields({
  initial,
  disabled,
}: {
  initial?: Partial<Partner>;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full name <span className="text-red-300">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            defaultValue={initial?.full_name ?? ""}
            disabled={disabled}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            type="text"
            name="company"
            defaultValue={initial?.company ?? ""}
            disabled={disabled}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Type <span className="text-red-300">*</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {PARTNER_TYPES.map((t) => (
            <label
              key={t.value}
              className="cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                defaultChecked={(initial?.type ?? "iul_advisor") === t.value}
                required
                disabled={disabled}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={initial?.email ?? ""}
            disabled={disabled}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            defaultValue={initial?.phone ?? ""}
            disabled={disabled}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">License number</label>
          <input
            type="text"
            name="license_number"
            defaultValue={initial?.license_number ?? ""}
            disabled={disabled}
            className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">License state</label>
          <input
            type="text"
            name="license_state"
            maxLength={2}
            placeholder="TX"
            defaultValue={initial?.license_state ?? ""}
            disabled={disabled}
            className="w-32 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 uppercase focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Vetting status</label>
        <div className="flex gap-2 flex-wrap">
          {VETTING_STATUSES.map((s) => (
            <label
              key={s.value}
              className="cursor-pointer rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm hover:border-white/20 has-[:checked]:border-white/40 has-[:checked]:bg-white/[0.06]"
            >
              <input
                type="radio"
                name="vetting_status"
                value={s.value}
                defaultChecked={(initial?.vetting_status ?? "pending") === s.value}
                required
                disabled={disabled}
                className="sr-only"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Vetting notes</label>
        <textarea
          name="vetting_notes"
          rows={3}
          defaultValue={initial?.vetting_notes ?? ""}
          disabled={disabled}
          placeholder="Context, red flags, references checked…"
          className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
        />
      </div>
    </div>
  );
}
