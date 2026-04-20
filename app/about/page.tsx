import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GOLDKEY Estates and our vision for premium real estate.",
};

const team = [
  { name: "Alexander Muriuki", role: "Managing Partner" },
  { name: "Nadia Wanjiku", role: "Director, Advisory" },
  { name: "Daniel Otieno", role: "Head of Investments" },
];

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-10">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">About Us</p>
        <h1 className="text-4xl font-semibold">A Real Estate Advisory Built on Trust</h1>
        <p className="max-w-3xl text-zinc-700">
          GOLDKEY Estates is a premium real estate practice focused on curation,
          market intelligence, and transaction excellence for private clients and
          institutional investors.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="mt-4 leading-8 text-zinc-700">
            To deliver exceptional property outcomes through trusted advice, premium
            service standards, and data-led market guidance.
          </p>
        </div>
        <div className="rounded-sm border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-semibold">Vision</h2>
          <p className="mt-4 leading-8 text-zinc-700">
            To be East Africa&apos;s most respected luxury property brand for buyers,
            sellers, and investors seeking long-term value.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold">Leadership Team</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="rounded-sm border border-zinc-200 p-6">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{member.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
