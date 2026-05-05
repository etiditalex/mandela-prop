export const metadata = {
  title: "Karim Podcast",
};

const YOUTUBE_EMBED_URL =
  "https://www.youtube.com/embed?listType=search&list=Karim%20Podcast";

export default function KarimPodcastPage() {
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
          Streaming from YouTube search for “Karim Podcast”. When you have a specific YouTube playlist
          or channel link, we can switch this to embed it directly.
        </p>

        <div className="mt-8 overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src={YOUTUBE_EMBED_URL}
              title="Karim Podcast"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

