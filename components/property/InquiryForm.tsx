"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, message }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus(body.error ?? "Unable to submit inquiry.");
      setLoading(false);
      return;
    }

    setStatus("Inquiry submitted successfully.");
    setMessage("");
    setLoading(false);
  };

  return (
    <form className="space-y-3 border-t border-zinc-200 pt-4" onSubmit={onSubmit}>
      <h3 className="text-lg font-semibold">Send Inquiry</h3>
      <textarea
        className="w-full rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-gold"
        rows={4}
        placeholder="Share your interest, preferred viewing date, and budget."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      {status && <p className="text-xs text-zinc-600">{status}</p>}
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit Inquiry"}
      </Button>
    </form>
  );
}
