"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type PodcastRow = {
  id: string;
  title: string | null;
  description: string | null;
  youtube_url: string;
  youtube_id: string | null;
  published_at: string | null;
  created_at: string;
};

const PODCAST_COLUMNS = "id, title, description, youtube_url, youtube_id, published_at, created_at";
const PODCAST_COLUMNS_WITHOUT_DESCRIPTION = "id, title, youtube_url, youtube_id, published_at, created_at";

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, timeoutMessage: string) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  });
}

function asPodcastRow(raw: Record<string, unknown>): PodcastRow {
  return {
    id: String(raw.id),
    title: (raw.title as string | null) ?? null,
    description: (raw.description as string | null) ?? null,
    youtube_url: String(raw.youtube_url ?? ""),
    youtube_id: (raw.youtube_id as string | null) ?? null,
    published_at: (raw.published_at as string | null) ?? null,
    created_at: String(raw.created_at ?? new Date().toISOString()),
  };
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace("/", "").trim();
      return id || null;
    }
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // Shorts: /shorts/{id}
      const parts = u.pathname.split("/").filter(Boolean);
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
      // Embed: /embed/{id}
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function EditorModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Partial<PodcastRow>;
  onClose: () => void;
  onSaved: (row: PodcastRow) => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [youtubeUrl, setYouTubeUrl] = useState(initial.youtube_url ?? "");
  const [published, setPublished] = useState(Boolean(initial.published_at));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const url = youtubeUrl.trim();
    if (!url) {
      setError("YouTube link is required.");
      setSaving(false);
      return;
    }
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      setError("Please paste a valid YouTube video link (watch, youtu.be, shorts, or embed).");
      setSaving(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const sessionResult = await withTimeout(
        supabase.auth.getSession(),
        8000,
        "Sign-in check is taking too long. Refresh the page and try again.",
      );
      if (!sessionResult.data.session) {
        throw new Error("Your sign-in expired. Sign in again, then save the video.");
      }

      const payload: Record<string, unknown> = {
        title: title.trim() || null,
        description: description.trim() || null,
        youtube_url: url,
        youtube_id: youtubeId,
        published_at: published ? initial.published_at ?? new Date().toISOString() : null,
      };
      if (mode === "create") {
        payload.created_by = sessionResult.data.session.user.id;
      }

      const save = async (body: Record<string, unknown>, columns: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const table = (supabase as any).from("podcast_videos");
        if (mode === "create") {
          return table.insert(body).select(columns);
        }
        if (!initial.id) throw new Error("Missing video id.");
        return table.update(body).eq("id", initial.id).select(columns);
      };

      let columns = PODCAST_COLUMNS;
      let result = await withTimeout(
        save(payload, columns),
        15000,
        "Saving is taking too long. Refresh the page — the video may already be saved.",
      );
      if (result.error && String(result.error.message).toLowerCase().includes("description")) {
        delete payload.description;
        columns = PODCAST_COLUMNS_WITHOUT_DESCRIPTION;
        result = await withTimeout(
          save(payload, columns),
          15000,
          "Saving is taking too long. Refresh the page — the video may already be saved.",
        );
      }
      if (result.error && String(result.error.message).toLowerCase().includes("created_by")) {
        delete payload.created_by;
        result = await withTimeout(
          save(payload, columns),
          15000,
          "Saving is taking too long. Refresh the page — the video may already be saved.",
        );
      }
      if (result.error) throw new Error(result.error.message);

      const saved = Array.isArray(result.data) ? result.data[0] : null;
      if (!saved) {
        throw new Error("The video was not saved. Sign in again as an admin, then try once more.");
      }

      onSaved(asPodcastRow(saved as Record<string, unknown>));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save video.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={mode === "create" ? "Add podcast video" : "Edit podcast video"}
      panelClassName="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <Input id="pod_title" label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="pod_description">
          <span className="font-medium">Summary (optional)</span>
          <textarea
            id="pod_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-karim-500 focus:ring-2 focus:ring-karim-100"
            placeholder="Short text shown under the episode title."
          />
        </label>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="pod_published">
          <span className="font-medium">Visibility</span>
          <select
            id="pod_published"
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-karim-500 focus:ring-2 focus:ring-karim-100"
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (public)</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="pod_url">
          <span className="font-medium">YouTube link</span>
          <input
            id="pod_url"
            value={youtubeUrl}
            onChange={(e) => setYouTubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-karim-500 focus:ring-2 focus:ring-karim-100"
          />
          <p className="text-xs text-zinc-500">
            Supported: `watch?v=`, `youtu.be/`, `shorts/`, `embed/`.
          </p>
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

export default function PodcastAdminPage() {
  const [rows, setRows] = useState<PodcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PodcastRow | null>(null);

  const load = async (allowEmpty = true) => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const sessionResult = await withTimeout(
        supabase.auth.getSession(),
        8000,
        "Sign-in check is taking too long. Refresh the page.",
      );
      if (!sessionResult.data.session) {
        setError("Your sign-in expired, so videos cannot be listed. Sign in again.");
        return;
      }

      const query = async (columns: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (supabase as any)
          .from("podcast_videos")
          .select(columns)
          .order("created_at", { ascending: false })
          .limit(200);
      };

      let result = await withTimeout(
        query(PODCAST_COLUMNS),
        12000,
        "Loading videos is taking too long. Refresh the page.",
      );
      if (result.error && String(result.error.message).toLowerCase().includes("description")) {
        result = await withTimeout(
          query(PODCAST_COLUMNS_WITHOUT_DESCRIPTION),
          12000,
          "Loading videos is taking too long. Refresh the page.",
        );
      }
      if (result.error) {
        setError(result.error.message);
        return;
      }

      const next = ((result.data as Record<string, unknown>[] | null) ?? []).map(asPodcastRow);
      if (next.length === 0 && !allowEmpty) return;
      setRows(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load podcast videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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
      const { error: dError } = await (supabase as any).from("podcast_videos").delete().eq("id", id);
      if (dError) {
        setError(dError.message);
        return;
      }
      setMessage("Video deleted.");
      await load();
    } catch {
      setError("Unable to delete video.");
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
          onClose={() => setCreateOpen(false)}
          onSaved={(row) => {
            setCreateOpen(false);
            setMessage(
              row.published_at
                ? "Video published. It stays in this list and shows on the public Karim Podcast page."
                : "Video saved as a draft. It stays in this list. Choose Published when it should appear on the public page.",
            );
            setRows((current) => [row, ...current.filter((item) => item.id !== row.id)]);
            void load(false);
          }}
        />
      ) : null}

      {editTarget ? (
        <EditorModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(row) => {
            setEditTarget(null);
            setMessage(row.published_at ? "Video updated and published." : "Video updated and kept as a draft.");
            setRows((current) => current.map((item) => (item.id === row.id ? row : item)));
            void load(false);
          }}
        />
      ) : null}

      <AgentPageHeader
        title="Podcast"
        breadcrumb="Karim podcast"
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Add video
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
          <h3 className="text-lg font-bold text-slate-900">Videos</h3>
          <p className="mt-1 text-sm text-slate-500">
            Add a YouTube link, then publish it. The episode shows on the public Karim Podcast page, where visitors can watch it on the site or follow it on YouTube.
          </p>
        </div>
        {error ? <p className="px-6 py-4 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="px-6 py-4 text-sm text-emerald-700">{message}</p> : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">YouTube</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{r.title || "(untitled)"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.published_at ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"}`}>
                      {r.published_at ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={r.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-black underline underline-offset-2"
                    >
                      Open
                    </a>
                  </td>
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
                  <td colSpan={4} className="px-6 py-14 text-center text-sm text-slate-500">
                    {loading ? "Loading videos..." : "No videos yet. Click “Add video”."}
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

