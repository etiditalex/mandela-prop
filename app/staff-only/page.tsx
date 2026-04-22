import Link from "next/link";

export default function StaffOnlyPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Staff access</p>
      <h1 className="mt-4 text-3xl font-semibold">Dashboard is for agents and admins</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-600">
        Your account is signed in as a client. Property management tools are available to verified
        agents and administrators. Browse listings or contact support if you need a staff account.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/properties"
          className="inline-flex items-center justify-center rounded-sm border border-brand bg-brand px-5 py-3 text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-brand/90"
        >
          Browse properties
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-sm border border-zinc-300 bg-transparent px-5 py-3 text-sm font-semibold tracking-wide text-black transition-colors duration-200 hover:border-brand hover:text-brand"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
