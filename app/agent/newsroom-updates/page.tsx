"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NewsUpdateKind = "blog" | "property";

type NewsUpdateRow = {
  id: string;
  kind: NewsUpdateKind;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  related_property_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PropertyRowLite = { id: string; title: string; slug: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, timeoutMessage: string) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

function assertImageAcceptable(file: File) {
  const maxBytes = 12 * 1024 * 1024; // 12MB
  if (file.size > maxBytes) {
    throw new Error(
      `Image is too large (${Math.ceil(file.size / (1024 * 1024))}MB). Please upload an image under 12MB.`,
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
}

async function compressImageForUpload(file: File) {
  if (file.size <= 900 * 1024) return file;
  const typeLower = file.type.toLowerCase();
  const nameLower = file.name.toLowerCase();
  const isPng = typeLower.includes("png") || nameLower.endsWith(".png");
  const isGif = typeLower.includes("gif") || nameLower.endsWith(".gif");
  if (isPng || isGif) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82);
    });
    if (!blob) return file;
    if (blob.size >= file.size) return file;
    const compressedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function EditorModal({
  mode,
  initial,
  properties,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Partial<NewsUpdateRow>;
  properties: PropertyRowLite[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState<NewsUpdateKind>((initial.kind as NewsUpdateKind) ?? "blog");
  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [content, setContent] = useState(initial.content ?? "");
  const [relatedPropertyId, setRelatedPropertyId] = useState<string>(initial.related_property_id ?? "");
  const [published, setPublished] = useState(Boolean(initial.published_at));
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug && title.trim().length >= 3) {
      setSlug(slugify(title));
    }
    // only react to title edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const titleTrimmed = title.trim();
    const slugTrimmed = slugify(slug || titleTrimmed);
    if (titleTrimmed.length < 3) {
      setError("Title must be at least 3 characters.");
      setSaving(false);
      return;
    }
    if (!slugTrimmed) {
      setError("Slug is required.");
      setSaving(false);
      return;
    }
    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();

      let coverImageUrl = initial.cover_image_url ?? null;
      if (coverImage) {
        assertImageAcceptable(coverImage);
        const uploadFile = await compressImageForUpload(coverImage);
        assertImageAcceptable(uploadFile);
        const ext = uploadFile.name.split(".").pop() || "jpg";
        const path = `newsroom/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await withTimeout(
          supabase.storage.from("property-images").upload(path, uploadFile, { upsert: false }),
          120000,
          "Cover image upload is taking too long. Try again.",
        );
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
        coverImageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        kind,
        title: titleTrimmed,
        slug: slugTrimmed,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image_url: coverImageUrl,
        related_property_id: relatedPropertyId || null,
        published_at: published ? new Date().toISOString() : null,
      };

      if (mode === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from("news_updates").insert(payload);
        if (insertError) throw new Error(insertError.message);
      } else {
        if (!initial.id) throw new Error("Missing update id.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from("news_updates")
          .update(payload)
          .eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={mode === "create" ? "New newsroom update" : "Edit newsroom update"}
      panelClassName="max-h-[90vh] max-w-3xl overflow-y-auto"
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="news_kind">
          <span className="font-medium">Type</span>
          <select
            id="news_kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as NewsUpdateKind)}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="blog">Blog / announcement</option>
            <option value="property">Property update</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="news_published">
          <span className="font-medium">Visibility</span>
          <select
            id="news_published"
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (public)</option>
          </select>
        </label>

        <Input id="news_title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input id="news_slug" label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />

        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="news_excerpt">
          <span className="font-medium">Excerpt (optional)</span>
          <textarea
            id="news_excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Short summary shown on the Newsroom page."
          />
        </label>

        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="news_content">
          <span className="font-medium">Content</span>
          <textarea
            id="news_content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Write the full update here."
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="news_related_property">
          <span className="font-medium">Related property (optional)</span>
          <select
            id="news_related_property"
            value={relatedPropertyId}
            onChange={(e) => setRelatedPropertyId(e.target.value)}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">None</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="news_cover">
          <span className="font-medium">Cover image (optional)</span>
          <input
            id="news_cover"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className="rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors file:mr-3 file:rounded-sm file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {initial.cover_image_url ? (
            <p className="text-xs text-zinc-500">Existing cover is set. Uploading replaces it.</p>
          ) : null}
        </label>

        {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-3 md:col-span-2">
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

export default function NewsroomUpdatesAdminPage() {
  const [rows, setRows] = useState<NewsUpdateRow[]>([]);
  const [properties, setProperties] = useState<PropertyRowLite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NewsUpdateRow | null>(null);

  const load = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: qError } = await (supabase as any)
        .from("news_updates")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: true })
        .order("created_at", { ascending: false })
        .limit(200);
      if (qError) {
        setError(qError.message);
        return;
      }
      setRows(((data as unknown) as NewsUpdateRow[] | null) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load updates.");
    }
  };

  const loadProperties = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from("properties").select("id,title,slug").order("created_at", { ascending: false }).limit(300);
      setProperties(((data as unknown) as PropertyRowLite[] | null) ?? []);
    } catch {
      setProperties([]);
    }
  };

  useEffect(() => {
    void load();
    void loadProperties();
  }, []);

  const publishLabel = (r: NewsUpdateRow) => (r.published_at ? "Published" : "Draft");

  const stats = useMemo(() => {
    let publishedCount = 0;
    for (const r of rows) if (r.published_at) publishedCount += 1;
    return { total: rows.length, published: publishedCount, drafts: rows.length - publishedCount };
  }, [rows]);

  const onDelete = async (id: string) => {
    setBusy(id);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dError } = await (supabase as any).from("news_updates").delete().eq("id", id);
      if (dError) {
        setError(dError.message);
        return;
      }
      setMessage("Update deleted.");
      await load();
    } catch {
      setError("Unable to delete update.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {createOpen ? (
        <EditorModal
          mode="create"
          initial={{}}
          properties={properties}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            void load();
          }}
        />
      ) : null}

      {editTarget ? (
        <EditorModal
          mode="edit"
          initial={editTarget}
          properties={properties}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            void load();
          }}
        />
      ) : null}

      <AgentPageHeader
        title="Newsroom/Updates"
        breadcrumb="Dashboard / Newsroom / Updates"
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            New update
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Published</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Drafts</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.drafts}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Posts</h3>
          <p className="mt-1 text-sm text-slate-500">Create announcements and property updates for the public Newsroom.</p>
        </div>
        {error ? <p className="px-6 py-4 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="px-6 py-4 text-sm text-emerald-700">{message}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{r.title}</p>
                    {r.excerpt ? <p className="mt-1 text-xs text-slate-500">{r.excerpt}</p> : null}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{r.kind}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.published_at ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"}`}>
                      {publishLabel(r)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTarget(r)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => void onDelete(r.id)}
                        className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-slate-500">
                    No updates yet. Click “New update”.
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

