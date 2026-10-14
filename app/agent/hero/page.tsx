"use client";

import { FormEvent, useEffect, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DEFAULT_HERO_COPY } from "@/lib/homepageContent";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadSiteImage } from "@/lib/uploadSiteImage";

type HeroSettings = {
  headline: string;
  accent: string;
  supporting_text: string;
  cta_label: string;
  cta_href: string;
};

type HeroSlideRow = {
  id: string;
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

function SlideModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Partial<HeroSlideRow>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [alt, setAlt] = useState(initial.alt ?? "");
  const [imageUrl, setImageUrl] = useState(initial.image_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(mode === "create" ? true : Boolean(initial.published_at));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!alt.trim()) {
      setError("Describe the image so it stays accessible.");
      return;
    }
    if (mode === "create" && !file && !imageUrl.trim()) {
      setError("Upload an image or paste an image URL.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const nextUrl = file ? await uploadSiteImage(file, "hero") : imageUrl.trim();
      if (!nextUrl) throw new Error("An image is required.");
      const payload = {
        alt: alt.trim(),
        image_url: nextUrl,
        published_at: published ? initial.published_at ?? new Date().toISOString() : null,
      };

      if (mode === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any).from("homepage_hero_slides").select("sort_order").order("sort_order", { ascending: false }).limit(1);
        const sortOrder = ((existing?.[0]?.sort_order as number | undefined) ?? -1) + 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from("homepage_hero_slides").insert({ ...payload, sort_order: sortOrder });
        if (insertError) throw new Error(insertError.message);
      } else {
        if (!initial.id) throw new Error("Missing slide id.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any).from("homepage_hero_slides").update(payload).eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
      }
      onSaved();
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to save slide."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === "create" ? "Add hero image" : "Edit hero image"} panelClassName="max-w-xl">
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input id="hero_alt" label="Image description" value={alt} onChange={(event) => setAlt(event.target.value)} required />
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="hero_file">
          <span className="font-medium">Upload image</span>
          <input id="hero_file" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className={fieldClass} />
        </label>
        <Input
          id="hero_url"
          label="Or paste an image URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://"
        />
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

export default function HeroAdminPage() {
  const [settings, setSettings] = useState<HeroSettings>({
    headline: DEFAULT_HERO_COPY.headline,
    accent: DEFAULT_HERO_COPY.accent,
    supporting_text: DEFAULT_HERO_COPY.supporting,
    cta_label: DEFAULT_HERO_COPY.ctaLabel,
    cta_href: DEFAULT_HERO_COPY.ctaHref,
  });
  const [slides, setSlides] = useState<HeroSlideRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingCopy, setSavingCopy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HeroSlideRow | null>(null);

  const load = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const [settingsResult, slidesResult] = await Promise.all([
        client.from("homepage_hero_settings").select("headline, accent, supporting_text, cta_label, cta_href").eq("id", 1).maybeSingle(),
        client.from("homepage_hero_slides").select("*").order("sort_order", { ascending: true }),
      ]);
      if (settingsResult.error) throw new Error(settingsResult.error.message);
      if (slidesResult.error) throw new Error(slidesResult.error.message);
      if (settingsResult.data) setSettings(settingsResult.data as HeroSettings);
      setSlides((slidesResult.data as HeroSlideRow[] | null) ?? []);
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to load the hero."));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveCopy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingCopy(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: saveError } = await (supabase as any).from("homepage_hero_settings").upsert({
        id: 1,
        headline: settings.headline.trim(),
        accent: settings.accent.trim(),
        supporting_text: settings.supporting_text.trim(),
        cta_label: settings.cta_label.trim(),
        cta_href: settings.cta_href.trim() || "/properties",
      });
      if (saveError) throw new Error(saveError.message);
      setMessage("Hero text is live on the homepage.");
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to save hero text."));
    } finally {
      setSavingCopy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setBusy(item.id);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const results = await Promise.all(
        next.map((row, order) => client.from("homepage_hero_slides").update({ sort_order: order }).eq("id", row.id)),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
      setSlides(next.map((row, order) => ({ ...row, sort_order: order })));
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to reorder slides."));
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
      const { error: deleteError } = await (supabase as any).from("homepage_hero_slides").delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);
      setMessage("Slide removed.");
      await load();
    } catch (err) {
      setError(explain(err instanceof Error ? err.message : "Unable to delete slide."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {createOpen ? (
        <SlideModal
          mode="create"
          initial={{}}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            setMessage("Slide added. It now appears in the homepage hero.");
            void load();
          }}
        />
      ) : null}
      {editTarget ? (
        <SlideModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            setMessage("Slide updated.");
            void load();
          }}
        />
      ) : null}

      <AgentPageHeader
        title="Hero"
        breadcrumb="homepage"
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Add image
          </Button>
        }
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={saveCopy} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-zinc-900">Hero text</h2>
          <p className="mt-1 text-sm text-zinc-500">This headline, supporting line, and button show on the public homepage.</p>
        </div>
        <Input id="headline" label="Headline" value={settings.headline} onChange={(event) => setSettings((current) => ({ ...current, headline: event.target.value }))} required />
        <Input id="accent" label="Accent line" value={settings.accent} onChange={(event) => setSettings((current) => ({ ...current, accent: event.target.value }))} />
        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="supporting">
          <span className="font-medium">Supporting text</span>
          <textarea id="supporting" rows={3} className={fieldClass} value={settings.supporting_text} onChange={(event) => setSettings((current) => ({ ...current, supporting_text: event.target.value }))} required />
        </label>
        <Input id="cta_label" label="Button label" value={settings.cta_label} onChange={(event) => setSettings((current) => ({ ...current, cta_label: event.target.value }))} required />
        <Input id="cta_href" label="Button link" value={settings.cta_href} onChange={(event) => setSettings((current) => ({ ...current, cta_href: event.target.value }))} required />
        <div>
          <Button type="submit" disabled={savingCopy}>
            {savingCopy ? "Saving..." : "Save hero text"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">Background slides</h2>
          <p className="mt-1 text-sm text-zinc-500">Published images rotate in the hero. Order here is the order on the site.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide, index) => (
                <tr key={slide.id} className="border-b border-zinc-50">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.image_url} alt="" className="h-14 w-24 object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{slide.alt}</td>
                  <td className="px-4 py-3">{slide.published_at ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" disabled={index === 0 || busy === slide.id} onClick={() => void move(index, -1)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs disabled:opacity-40">
                        Up
                      </button>
                      <button type="button" disabled={index === slides.length - 1 || busy === slide.id} onClick={() => void move(index, 1)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs disabled:opacity-40">
                        Down
                      </button>
                      <button type="button" onClick={() => setEditTarget(slide)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs">
                        Edit
                      </button>
                      <button type="button" disabled={busy === slide.id} onClick={() => void onDelete(slide.id)} className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs text-red-600 disabled:opacity-60">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {slides.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-sm text-zinc-500">
                    No hero images yet. Add one and it will show on the homepage.
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
