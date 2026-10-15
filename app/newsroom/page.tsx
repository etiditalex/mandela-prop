export const metadata = {
  title: "Newsroom",
};

import { InsightCard, InsightSection } from "@/components/newsroom/InsightLayout";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function previewText(excerpt: string | null, content: string | null) {
  const source = (excerpt || content || "").replace(/\s+/g, " ").trim();
  if (!source) return null;
  return source.length > 220 ? `${source.slice(0, 217).trimEnd()}...` : source;
}

export default async function NewsroomPage() {
  const supabase = createSupabaseServerClient();

  const { data } = supabase
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("news_updates")
        .select("id, title, slug, excerpt, content, cover_image_url, published_at")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(24)
    : { data: [] as unknown[] };

  const updates = (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image_url: string | null;
  }>;

  return (
    <InsightSection title="Latest updates">
      {updates.length === 0 ? (
        <p className="text-center text-sm text-zinc-600 md:col-span-2 lg:col-span-3">
          New updates from Karim Real Estate will appear here.
        </p>
      ) : (
        updates.map((update) => (
          <InsightCard
            key={update.id}
            title={update.title}
            excerpt={previewText(update.excerpt, update.content)}
            href={`/newsroom/${update.slug}`}
            action="Read more"
            media={
              update.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={update.cover_image_url}
                  alt={update.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-end bg-cream p-4 text-sm font-semibold text-black">{update.title}</div>
              )
            }
          />
        ))
      )}
    </InsightSection>
  );
}
