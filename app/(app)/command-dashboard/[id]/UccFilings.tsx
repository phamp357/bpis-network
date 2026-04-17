"use client";

import { useState, useTransition } from "react";
import {
  addUccFilingAction,
  setUccStatusAction,
  deleteUccFilingAction,
} from "../actions";
import { UCC_STATUS_STYLES, uccStatusLabel } from "@/lib/deals";

type Filing = {
  id: string;
  filing_state: string;
  filing_number: string | null;
  debtor: string;
  secured_party: string;
  collateral_description: string | null;
  status: string;
  filed_at: string | null;
  created_at: string;
};

type UccStatus = "draft" | "filed" | "amended" | "terminated";

export default function UccFilings({
  dealId,
  filings,
}: {
  dealId: string;
  filings: Filing[];
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await addUccFilingAction(dealId, formData);
        form.reset();
        setAdding(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add filing");
      }
    });
  }

  function setStatus(filingId: string, next: UccStatus, filingNumber?: string) {
    startTransition(async () => {
      await setUccStatusAction(dealId, filingId, next, filingNumber);
    });
  }

  function onDelete(filingId: string) {
    if (!confirm("Remove this UCC filing? If it was actually filed, do not delete.")) return;
    startTransition(async () => {
      await deleteUccFilingAction(dealId, filingId);
    });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            UCC filings
          </div>
          <div className="text-sm text-white/60 mt-0.5">
            {filings.length} {filings.length === 1 ? "filing" : "filings"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-md bg-white/10 text-white text-sm px-3 py-1.5 hover:bg-white/15"
        >
          {adding ? "Cancel" : "+ New filing"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={onSubmit}
          className="p-5 border-b border-white/10 space-y-4 bg-black/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Filing state <span className="text-red-300">*</span>
              </label>
              <input
                type="text"
                name="filing_state"
                required
                maxLength={2}
                placeholder="TX"
                disabled={isPending}
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 uppercase focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Debtor <span className="text-red-300">*</span>
              </label>
              <input
                type="text"
                name="debtor"
                required
                disabled={isPending}
                placeholder="Meridian Logistics LLC"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Secured party <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              name="secured_party"
              required
              disabled={isPending}
              placeholder="BPIS Acquisition SPV I, LLC"
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Collateral description
            </label>
            <textarea
              name="collateral_description"
              rows={3}
              disabled={isPending}
              placeholder="All assets, including but not limited to equipment, accounts, and contract rights."
              className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-white text-black font-medium px-4 py-1.5 text-sm hover:bg-white/90 disabled:opacity-60 transition"
            >
              {isPending ? "Adding…" : "Create draft"}
            </button>
          </div>
        </form>
      )}

      {filings.length === 0 && !adding && (
        <div className="px-5 py-8 text-center text-sm text-white/50">
          No UCC filings yet.
        </div>
      )}

      {filings.length > 0 && (
        <ul className="divide-y divide-white/10">
          {filings.map((f) => (
            <li key={f.id} className="px-5 py-4">
              <div className="flex items-start gap-3 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${UCC_STATUS_STYLES[f.status] ?? ""}`}
                >
                  {uccStatusLabel(f.status)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="text-white/50">State:</span>{" "}
                    <span className="text-white">{f.filing_state}</span>
                    {f.filing_number && (
                      <>
                        {" · "}
                        <span className="text-white/50">Number:</span>{" "}
                        <span className="text-white">{f.filing_number}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-white/50">Debtor:</span>{" "}
                    <span className="text-white">{f.debtor}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white/50">Secured party:</span>{" "}
                    <span className="text-white">{f.secured_party}</span>
                  </div>
                  {f.collateral_description && (
                    <div className="text-xs text-white/60 mt-2">
                      {f.collateral_description}
                    </div>
                  )}
                  {f.filed_at && (
                    <div className="text-xs text-white/40 mt-1">
                      Filed {new Date(f.filed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(f.id)}
                  disabled={isPending}
                  className="text-xs text-white/40 hover:text-red-300 shrink-0"
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              {/* Status transitions */}
              <div className="flex gap-1 flex-wrap mt-3">
                {f.status === "draft" && (
                  <MarkFiledButton
                    onMark={(num) => setStatus(f.id, "filed", num)}
                    disabled={isPending}
                  />
                )}
                {f.status === "filed" && (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setStatus(f.id, "amended")}
                      className="text-xs px-2 py-1 rounded-md border border-white/10 bg-black/20 text-white/80 hover:border-white/20"
                    >
                      Mark amended
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setStatus(f.id, "terminated")}
                      className="text-xs px-2 py-1 rounded-md border border-white/10 bg-black/20 text-white/80 hover:border-white/20"
                    >
                      Terminate
                    </button>
                  </>
                )}
                {f.status === "amended" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setStatus(f.id, "terminated")}
                    className="text-xs px-2 py-1 rounded-md border border-white/10 bg-black/20 text-white/80 hover:border-white/20"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MarkFiledButton({
  onMark,
  disabled,
}: {
  onMark: (filingNumber?: string) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [num, setNum] = useState("");

  if (!expanded) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setExpanded(true)}
        className="text-xs px-2 py-1 rounded-md border border-white/10 bg-black/20 text-white/80 hover:border-white/20"
      >
        Mark as filed…
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={num}
        onChange={(e) => setNum(e.target.value)}
        placeholder="Filing number"
        disabled={disabled}
        className="rounded-md bg-black/40 border border-white/10 px-2 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 w-40"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onMark(num.trim() || undefined);
          setExpanded(false);
          setNum("");
        }}
        className="text-xs px-2 py-1 rounded-md bg-white text-black font-medium hover:bg-white/90"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="text-xs px-2 py-1 text-white/50 hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}
