import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type NewsUpdate = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
};

async function getUpdate(slug: string): Promise<NewsUpdate | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("news_updates")
    .select("title, slug, excerpt, content, cover_image_url")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  return (data as NewsUpdate | null) ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const update = await getUpdate(params.slug);
  if (!update) return { title: "Update" };
  return { title: update.title, description: update.excerpt || undefined };
}

export default async function NewsUpdatePage({ params }: { params: { slug: string } }) {
  const update = await getUpdate(params.slug);
  if (!update) notFound();

  return (
    <article className="bg-white px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/newsroom"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-black underline decoration-brand decoration-2 underline-offset-4"
        >
          Latest updates
        </Link>
        <h1 className="mt-6 text-3xl font-bold leading-tight text-black sm:text-4xl">{update.title}</h1>
        {update.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={update.cover_image_url} alt={update.title} className="mt-8 w-full object-cover" />
        ) : null}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-zinc-700">{update.content}</div>
      </div>
    </article>
  );
}
