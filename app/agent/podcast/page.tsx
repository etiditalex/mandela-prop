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
  youtube_url: string;
  youtube_id: string | null;
  published_at: string | null;
  created_at: string;
};

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
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
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
      const payload = {
        title: title.trim() || null,
        youtube_url: url,
        youtube_id: youtubeId,
        published_at: published ? new Date().toISOString() : null,
      };

      if (mode === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from("podcast_videos").insert(payload);
        if (insertError) throw new Error(insertError.message);
      } else {
        if (!initial.id) throw new Error("Missing video id.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from("podcast_videos")
          .update(payload)
          .eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
      }

      onSaved();
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
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="pod_published">
          <span className="font-medium">Visibility</span>
          <select
            id="pod_published"
            value={published ? "published" : "draft"}
            onChange={(e) => setPublished(e.target.value === "published")}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PodcastRow | null>(null);

  const load = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: qError } = await (supabase as any)
        .from("podcast_videos")
        .select("*")
        .order("published_at", { ascending: false, nullsFirst: true })
        .order("created_at", { ascending: false })
        .limit(200);
      if (qError) {
        setError(qError.message);
        return;
      }
      setRows(((data as unknown) as PodcastRow[] | null) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load podcast videos.");
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
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            void load();
          }}
        />
      ) : null}

      <AgentPageHeader
        title="Podcast"
        breadcrumb="Dashboard / Podcast"
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
          <p className="mt-1 text-sm text-slate-500">Manage which Karim Podcast videos appear on the public page.</p>
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
                      className="text-xs font-medium text-blue-700 underline underline-offset-2"
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
                    No videos yet. Click “Add video”.
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

