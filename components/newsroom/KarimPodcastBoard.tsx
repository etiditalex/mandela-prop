"use client";

import { Play } from "lucide-react";
import { useState } from "react";

export type PublicPodcastVideo = {
  id: string;
  title: string | null;
  youtube_url: string;
  youtube_id: string | null;
  description?: string | null;
};

const actionClass =
  "inline-flex items-center justify-center border border-zinc-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:border-black";

function episodeTitle(video: PublicPodcastVideo) {
  return video.title?.trim() || "Karim Podcast";
}

function thumbnailUrl(video: PublicPodcastVideo) {
  if (!video.youtube_id) return null;
  return `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;
}

function embedUrl(video: PublicPodcastVideo) {
  if (!video.youtube_id) return video.youtube_url;
  return `https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`;
}

function Poster({
  video,
  onWatch,
}: {
  video: PublicPodcastVideo;
  onWatch: () => void;
}) {
  const title = episodeTitle(video);
  const thumb = thumbnailUrl(video);

  return (
    <button
      type="button"
      onClick={onWatch}
      className="group relative block h-full w-full bg-zinc-950 text-left"
      aria-label={`Watch ${title} on this page`}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 bg-zinc-900" />
      )}
      <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-black shadow-lg transition group-hover:scale-105">
        <Play size={22} fill="currentColor" aria-hidden />
      </span>
    </button>
  );
}

export function KarimPodcastBoard({ videos }: { videos: PublicPodcastVideo[] }) {
  const [selectedId, setSelectedId] = useState(videos[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const selected = videos.find((video) => video.id === selectedId) ?? videos[0];

  const watch = (id: string, scroll: boolean) => {
    setSelectedId(id);
    setPlaying(true);
    if (scroll) {
      document.getElementById("karim-podcast-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!selected) {
    return (
      <p className="mt-12 text-center text-sm text-zinc-600">New Karim Podcast episodes will appear here.</p>
    );
  }

  const title = episodeTitle(selected);

  return (
    <div className="mt-12">
      <div id="karim-podcast-player" className="scroll-mt-28">
        <div className="aspect-video w-full overflow-hidden bg-black">
          {playing ? (
            <iframe
              key={selected.id}
              className="h-full w-full"
              src={embedUrl(selected)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <Poster video={selected} onWatch={() => watch(selected.id, false)} />
          )}
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold leading-snug text-black sm:text-2xl">{title}</h2>
            {selected.description ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600">{selected.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {playing ? null : (
              <button type="button" className={`${actionClass} border-black bg-black text-white hover:bg-zinc-900`} onClick={() => watch(selected.id, false)}>
                Watch here
              </button>
            )}
            <a href={selected.youtube_url} target="_blank" rel="noreferrer" className={actionClass}>
              Follow on YouTube
            </a>
          </div>
        </div>
      </div>

      {videos.length > 1 ? (
        <div className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const cardTitle = episodeTitle(video);
            const active = video.id === selected.id;
            return (
              <article key={video.id} className="flex flex-col">
                <div className={`aspect-video w-full overflow-hidden bg-zinc-100 ${active ? "ring-2 ring-brand" : ""}`}>
                  <Poster video={video} onWatch={() => watch(video.id, true)} />
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-black">{cardTitle}</h3>
                {video.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">{video.description}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={actionClass} onClick={() => watch(video.id, true)}>
                    Watch here
                  </button>
                  <a href={video.youtube_url} target="_blank" rel="noreferrer" className={actionClass}>
                    Follow on YouTube
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
