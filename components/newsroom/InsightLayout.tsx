import Link from "next/link";
import { ReactNode } from "react";

export function InsightSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-center text-3xl font-bold uppercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
    </section>
  );
}

export function InsightCard({
  media,
  title,
  excerpt,
  href,
  action,
  external = false,
}: {
  media: ReactNode;
  title: string;
  excerpt?: string | null;
  href: string;
  action: string;
  external?: boolean;
}) {
  const actionClass =
    "mt-6 inline-flex border border-zinc-300 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:border-black";

  return (
    <article className="flex flex-col">
      <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">{media}</div>
      <h2 className="mt-4 text-lg font-bold leading-snug text-black">{title}</h2>
      {excerpt ? <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-600">{excerpt}</p> : null}
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={actionClass}>
          {action}
        </a>
      ) : (
        <Link href={href} className={actionClass}>
          {action}
        </Link>
      )}
    </article>
  );
}
