export const metadata = {
  title: "Karim Podcast",
};

import { KarimPodcastBoard, type PublicPodcastVideo } from "@/components/newsroom/KarimPodcastBoard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PodcastVideo = PublicPodcastVideo;

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
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-center text-3xl font-bold uppercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          Karim Podcast
        </h1>
        <KarimPodcastBoard videos={videos} />
      </div>
    </section>
  );
}
