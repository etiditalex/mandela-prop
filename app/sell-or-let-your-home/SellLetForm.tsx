"use client";

import { useState } from "react";

export function SellLetForm() {
  const [intent, setIntent] = useState<"sell" | "let">("sell");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/listing-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, intent }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Unable to submit.");
        setLoading(false);
        return;
      }
      form.reset();
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="intent">
        <span className="font-medium">I want to</span>
        <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-zinc-300 bg-white">
          <button
            type="button"
            onClick={() => setIntent("sell")}
            className={[
              "px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
              intent === "sell" ? "bg-brand text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            Sell
          </button>
          <button
            type="button"
            onClick={() => setIntent("let")}
            className={[
              "px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
              intent === "let" ? "bg-brand text-white" : "bg-transparent text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            Let
          </button>
        </div>
      </label>

      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="full_name">
        <span className="font-medium">Full name *</span>
        <input
          id="full_name"
          name="full_name"
          required
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="email">
        <span className="font-medium">Email *</span>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="phone">
        <span className="font-medium">Phone</span>
        <input
          id="phone"
          name="phone"
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="title">
        <span className="font-medium">Property title *</span>
        <input
          id="title"
          name="title"
          required
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="location">
        <span className="font-medium">Location *</span>
        <input
          id="location"
          name="location"
          required
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="property_type">
        <span className="font-medium">Property type *</span>
        <input
          id="property_type"
          name="property_type"
          required
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="bedrooms">
        <span className="font-medium">Bedrooms</span>
        <input
          id="bedrooms"
          name="bedrooms"
          type="number"
          min={0}
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="bathrooms">
        <span className="font-medium">Bathrooms</span>
        <input
          id="bathrooms"
          name="bathrooms"
          type="number"
          min={0}
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="price">
        <span className="font-medium">Expected price / rent</span>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="message">
        <span className="font-medium">Notes</span>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-brand"
        />
      </label>

      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      {success ? (
        <p className="md:col-span-2 text-sm text-emerald-700">
          Submitted. The team will review it in the admin dashboard.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="md:col-span-2 rounded-sm bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

