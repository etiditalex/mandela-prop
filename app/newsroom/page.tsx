export const metadata = {
  title: "Newsroom",
};

import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NewsroomPage() {
  // Server-render newsroom updates (published only via RLS).
  const supabase = createSupabaseServerClient();

  const { data } = supabase
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("news_updates")
        .select("id, kind, title, slug, excerpt, cover_image_url, related_property_id, published_at")
        .order("published_at", { ascending: false })
        .limit(24)
    : { data: [] as unknown[] };

  const updates = (data ?? []) as Array<{
    id: string;
    kind: "blog" | "property";
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
  }>;

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

          {updates.map((u) => (
            <article
              key={u.id}
              className="overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {u.cover_image_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.cover_image_url}
                    alt={u.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  {u.kind === "property" ? "Property update" : "Update"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{u.title}</h2>
                {u.excerpt ? <p className="mt-3 text-sm text-zinc-700">{u.excerpt}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

