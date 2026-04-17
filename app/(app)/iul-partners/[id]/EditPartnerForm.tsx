"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updatePartnerAction } from "../actions";
import PartnerFormFields from "../PartnerFormFields";

type Partner = {
  id: string;
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

export default function EditPartnerForm({ partner }: { partner: Partner }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updatePartnerAction(partner.id, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-white/10 bg-white/[0.03] p-5 space-y-6"
    >
      <PartnerFormFields initial={partner} disabled={isPending} />

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/iul-partners/${partner.id}`}
          className="text-sm text-white/60 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-white text-black font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
