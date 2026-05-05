"use client";

import { useEffect, useMemo, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type LeadRow = Database["public"]["Tables"]["listing_leads"]["Row"];

function badgeClass(status: LeadRow["status"]) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "contacted":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-100";
    case "closed":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

export default function AgentListingLeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const { data, error: qError } = await supabase
        .from("listing_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (qError) {
        setError(qError.message);
        return;
      }
      setRows((data as LeadRow[] | null) ?? []);
    } catch {
      setError("Unable to load listing leads.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, closed: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  const updateStatus = async (id: string, status: LeadRow["status"]) => {
    setBusy(id);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: uError } = await supabase.from("listing_leads").update({ status }).eq("id", id);
      if (uError) {
        setError(uError.message);
        setBusy(null);
        return;
      }
      await load();
    } catch {
      setError("Unable to update lead.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <AgentPageHeader
        title="Sell / Let leads"
        breadcrumb="Dashboard / Leads"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["new", "contacted", "closed"] as const).map((s) => (
          <div key={s} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{s}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Submissions</h3>
          <p className="mt-1 text-sm text-slate-500">Manage “Sell or let your home” submissions.</p>
        </div>
        {error ? <p className="px-6 py-4 text-sm text-red-600">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Intent</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Beds</th>
                <th className="px-4 py-3 font-medium">Baths</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{r.full_name}</p>
                    <p className="text-xs text-slate-500">{r.email}</p>
                    {r.phone ? <p className="text-xs text-slate-500">{r.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{r.intent}</td>
                  <td className="px-4 py-3 text-slate-700">{r.title}</td>
                  <td className="px-4 py-3 text-slate-700">{r.location}</td>
                  <td className="px-4 py-3 text-slate-700">{r.property_type}</td>
                  <td className="px-4 py-3 text-slate-700">{r.bedrooms}</td>
                  <td className="px-4 py-3 text-slate-700">{r.bathrooms}</td>
                  <td className="px-4 py-3 text-slate-700">{Number(r.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => void updateStatus(r.id, "contacted")}
                        className="rounded-lg border border-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50 disabled:opacity-60"
                      >
                        Contacted
                      </button>
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => void updateStatus(r.id, "closed")}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-14 text-center text-sm text-slate-500">
                    No leads yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

