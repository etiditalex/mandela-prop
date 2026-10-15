export const metadata = {
  title: "Karim Podcast",
};

import { InsightCard, InsightSection } from "@/components/newsroom/InsightLayout";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PodcastVideo = {
  id: string;
  title: string | null;
  youtube_url: string;
  youtube_id: string | null;
  description?: string | null;
};

export default async function KarimPodcastPage() {
  const supabase = createSupabaseServerClient();
  let videos: PodcastVideo[] = [];

  if (supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const withDescription = await client
      .from("podcast_videos")
      .select("id, title, youtube_url, youtube_id, description, published_at")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(24);

    if (!withDescription.error) {
      videos = (withDescription.data ?? []) as PodcastVideo[];
    } else {
      const fallback = await client
        .from("podcast_videos")
        .select("id, title, youtube_url, youtube_id, published_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(24);
      videos = (fallback.data ?? []) as PodcastVideo[];
    }
  }

  return (
    <InsightSection title="Karim Podcast">
      {videos.length === 0 ? (
        <p className="text-center text-sm text-zinc-600 md:col-span-2 lg:col-span-3">
          New Karim Podcast episodes will appear here.
        </p>
      ) : (
        videos.map((video) => {
          const title = video.title?.trim() || "Karim Podcast";
          const embedSrc = video.youtube_id
            ? `https://www.youtube.com/embed/${video.youtube_id}`
            : video.youtube_url;
          return (
            <InsightCard
              key={video.id}
              title={title}
              excerpt={video.description}
              href={video.youtube_url}
              action="Watch"
              external
              media={
                <iframe
                  className="h-full w-full"
                  src={embedSrc}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              }
            />
          );
        })
      )}
    </InsightSection>
  );
}
