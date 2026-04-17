"use client";

import { useState, useTransition } from "react";
import { createPartnerAction } from "../actions";
import PartnerFormFields from "../PartnerFormFields";

export default function CreatePartnerForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createPartnerAction(formData);
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
      <PartnerFormFields disabled={isPending} />

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-white text-black font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Saving…" : "Create partner"}
        </button>
      </div>
    </form>
  );
}
