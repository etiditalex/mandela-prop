export const metadata = {
  title: "Sell or let your home",
};

import { SellLetForm } from "./SellLetForm";

export default function SellOrLetYourHomePage() {
  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border border-zinc-300 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#123c2d,#0b0b0b)]" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative mx-auto flex min-h-[15rem] w-full max-w-[88rem] items-end px-6 pb-10 sm:min-h-[18rem] sm:px-10 sm:pb-12 lg:min-h-[22rem] lg:px-14 lg:pb-14">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Sell or let your home</h1>
            <div className="h-[3px] w-12 bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Agent listing</p>
          <h2 className="text-3xl font-semibold">Submit a property to list</h2>
          <p className="max-w-2xl text-sm leading-7 text-zinc-700">
            Agents can submit properties here. Submissions are saved to the database and can be managed in
            the admin dashboard.
          </p>
        </div>

        <div className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm">
          <SellLetForm />
        </div>
      </div>
    </section>
  );
}

