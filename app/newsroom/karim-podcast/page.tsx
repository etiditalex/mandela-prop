export const metadata = {
  title: "Karim Podcast",
};

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function KarimPodcastPage() {
  const supabase = createSupabaseServerClient();

  const { data } = supabase
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("podcast_videos")
        .select("id, title, youtube_url, youtube_id, published_at, created_at")
        .order("published_at", { ascending: false })
        .limit(24)
    : { data: [] as unknown[] };

  const videos = (data ?? []) as Array<{
    id: string;
    title: string | null;
    youtube_id: string | null;
    youtube_url: string;
  }>;

  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border border-zinc-300 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#123c2d,#0b0b0b)]" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative mx-auto flex min-h-[15rem] w-full max-w-[88rem] items-end px-6 pb-10 sm:min-h-[18rem] sm:px-10 sm:pb-12 lg:min-h-[22rem] lg:px-14 lg:pb-14">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Karim Podcast</h1>
            <div className="h-[3px] w-12 bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <p className="max-w-2xl text-sm leading-7 text-zinc-700">
          Latest Karim Podcast videos curated from the Admin Dashboard.
        </p>

        {videos.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {videos.map((v) => (
              <article key={v.id} className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full"
                    src={v.youtube_id ? `https://www.youtube.com/embed/${v.youtube_id}` : v.youtube_url}
                    title={v.title ?? "Karim Podcast"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-zinc-900">{v.title ?? "Karim Podcast"}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-zinc-200 bg-white p-6 text-sm text-zinc-700">
            No podcast videos yet. Add them from the Admin Dashboard → Podcast.
          </div>
        )}
      </div>
    </section>
  );
}

