"use client";

import { FormEvent, useEffect, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_PORTFOLIO_HEADING } from "@/lib/homepageContent";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadSiteImage } from "@/lib/uploadSiteImage";

type PortfolioRow = {
  id: string;
  label: string;
  title: string;
  description: string;
  image_url: string;
  alt: string;
  sort_order: number;
  published_at: string | null;
};

const fieldClass =
  "rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-brand";

function explain(message: string) {
  if (/homepage_|schema cache|does not exist|relation/i.test(message)) {
    return `${message} Run supabase/homepage.sql in the Supabase SQL editor, then refresh this page.`;
  }
  return message;
}

function CardModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Partial<PortfolioRow>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(initial.label ?? "");
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [alt, setAlt] = useState(initial.alt ?? "");
  const [imageUrl, setImageUrl] = useState(initial.image_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(mode === "create" ? true : Boolean(initial.published_at));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (title.trim().length < 3 || description.trim().length < 20) {
      setError("Add a title and a description of at least 20 characters.");
      return;
    }
    if (mode === "create" && !file && !imageUrl.trim()) {
      setError("Upload an image or paste an image URL.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const nextUrl = file ? await uploadSiteImage(file, "portfolio") : imageUrl.trim();
      if (!nextUrl) throw new Error("An image is required.");
      const payload = {
        label: label.trim() || "Advisory",
        title: title.trim(),
        description: description.trim(),
        alt: alt.trim() || title.trim(),
        image_url: nextUrl,
        published_at: published ? initial.published_at ?? new Date().toISOString() : null,
      };

      if (mode === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from("homepage_portfolio_items")
          .select("sort_order")
          .order("sort_order", { ascending: false })
          .limit(1);
        const sortOrder = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from("homepage_portfolio_items").insert({ ...payload, sort_order: sortOrder });
        if (insertError) throw new Error(insertError.message);
      } else {
        if (!initial.id) throw new Error("Missing card id.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any).from("homepage_portfolio_items").update(payload).eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
      }
      onSaved();
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to save card."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === "create" ? "Add portfolio card" : "Edit portfolio card"} panelClassName="max-h-[90vh] max-w-2xl overflow-y-auto">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="card_label" label="Label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Advisory" />
          <Input id="card_title" label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="card_description">
          <span className="font-medium">Description</span>
          <textarea id="card_description" rows={5} className={fieldClass} value={description} onChange={(event) => setDescription(event.target.value)} required />
        </label>
        <Input id="card_alt" label="Image description" value={alt} onChange={(event) => setAlt(event.target.value)} />
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="card_file">
          <span className="font-medium">Upload image</span>
          <input id="card_file" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={fieldClass} />
        </label>
        <Input id="card_url" label="Or paste an image URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://" />
        {initial.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initial.image_url} alt="" className="h-28 w-full object-cover" />
        ) : null}
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          Published on the homepage
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PortfolioAdminPage() {
  const [heading, setHeading] = useState(DEFAULT_PORTFOLIO_HEADING);
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingHeading, setSavingHeading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PortfolioRow | null>(null);

  const load = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const [settingsResult, itemsResult] = await Promise.all([
        client.from("homepage_portfolio_settings").select("heading").eq("id", 1).maybeSingle(),
        client.from("homepage_portfolio_items").select("*").order("sort_order", { ascending: true }),
      ]);
      if (settingsResult.error) throw new Error(settingsResult.error.message);
      if (itemsResult.error) throw new Error(itemsResult.error.message);
      if (settingsResult.data?.heading) setHeading(settingsResult.data.heading as string);
      setRows((itemsResult.data as PortfolioRow[] | null) ?? []);
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to load the portfolio section."));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveHeading = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingHeading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: saveError } = await (supabase as any).from("homepage_portfolio_settings").upsert({
        id: 1,
        heading: heading.trim() || DEFAULT_PORTFOLIO_HEADING,
      });
      if (saveError) throw new Error(saveError.message);
      setMessage("Section title is live on the homepage.");
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to save the title."));
    } finally {
      setSavingHeading(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setBusy(item.id);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const results = await Promise.all(
        next.map((row, order) => client.from("homepage_portfolio_items").update({ sort_order: order }).eq("id", row.id)),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
      setRows(next.map((row, order) => ({ ...row, sort_order: order })));
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to reorder cards."));
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (id: string) => {
    setBusy(id);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any).from("homepage_portfolio_items").delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);
      setMessage("Card removed.");
      await load();
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to delete card."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {createOpen ? (
        <CardModal
          mode="create"
          initial={{}}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            setMessage("Card added. It now appears in the Karim portfolio section.");
            void load();
          }}
        />
      ) : null}
      {editTarget ? (
        <CardModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            setMessage("Card updated.");
            void load();
          }}
        />
      ) : null}

      <AgentPageHeader
        title="Karim Portfolio"
        breadcrumb="homepage"
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Add card
          </Button>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={saveHeading} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input id="portfolio_heading" label="Section title" value={heading} onChange={(event) => setHeading(event.target.value)} required />
        </div>
        <Button type="submit" disabled={savingHeading}>
          {savingHeading ? "Saving..." : "Save title"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">Cards</h2>
          <p className="mt-1 text-sm text-zinc-500">Published cards appear under the hero, three at a time, in this order.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.image_url} alt="" className="h-14 w-24 object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-zinc-500">{row.label}</p>
                    <p className="font-semibold text-zinc-900">{row.title}</p>
                  </td>
                  <td className="px-4 py-3">{row.published_at ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" disabled={index === 0 || busy === row.id} onClick={() => void move(index, -1)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs disabled:opacity-40">
                        Up
                      </button>
                      <button type="button" disabled={index === rows.length - 1 || busy === row.id} onClick={() => void move(index, 1)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs disabled:opacity-40">
                        Down
                      </button>
                      <button type="button" onClick={() => setEditTarget(row)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs">
                        Edit
                      </button>
                      <button type="button" disabled={busy === row.id} onClick={() => void onDelete(row.id)} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs text-red-600 disabled:opacity-60">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-sm text-zinc-500">
                    No cards yet. Add one and it will show in the section under the hero.
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
