export const metadata = {
  title: "Newsroom",
};

import Link from "next/link";

export default function NewsroomPage() {
  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Newsroom</p>
          <h1 className="text-4xl font-semibold">Latest updates</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-700">
            Announcements, market notes, and media from Karim Real Estate.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/newsroom/karim-podcast"
            className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Podcast</p>
            <h2 className="mt-2 text-2xl font-semibold">Karim Podcast</h2>
            <p className="mt-3 text-sm text-zinc-700">
              Watch the latest episodes and conversations on property, investments, and lifestyle.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

