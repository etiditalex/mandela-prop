import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Karim Real Estate and our vision for premium real estate.",
};

const KARIM_PORTRAIT =
  "https://res.cloudinary.com/dyfnobo9r/image/upload/v1776763528/mandela_2_xvktej.jpg";

export default function AboutPage() {
  return (
    <section className="space-y-16 pb-8">
      <div className="relative">
        <div className="relative w-full overflow-hidden bg-brand pb-8 text-white sm:pb-10 lg:pb-36">
          <div className="absolute inset-0 bg-[linear-gradient(125deg,#164a36_0%,#1e5a42_45%,#164a36_100%)]" />
          <div className="absolute inset-y-0 left-1/2 w-[78%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(20,74,54,0.55)_0%,rgba(20,74,54,0.78)_100%)] sm:w-[60%] lg:w-[42%]" />
          <div className="absolute inset-y-0 left-1/2 w-[78%] -translate-x-1/2 bg-[url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-25 blur-[1.5px] sm:w-[60%] lg:w-[42%]" />
          <div className="absolute inset-y-0 left-1/2 w-[78%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(10,40,28,0.15)_0%,rgba(10,40,28,0.85)_100%)] sm:w-[60%] lg:w-[42%]" />

          <div className="relative mx-auto flex min-h-[30rem] w-full max-w-7xl items-end px-4 pt-12 sm:min-h-[34rem] sm:px-6 sm:pt-16 lg:min-h-[38rem] lg:px-10 lg:pt-20">
            <div className="relative z-20 mx-auto max-w-2xl px-2 pb-10 text-center sm:pb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85 sm:text-sm">
                Aiming To Be The Best
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Making Better
                <br />
                Real Estate
                <br />
                Decisions
              </h1>
              <div className="mx-auto mt-6 h-[2px] w-14 bg-white/70" />
              <p className="mx-auto mt-6 max-w-xl text-base font-semibold text-white/95 sm:text-xl lg:text-2xl">
                Introducing Karim Real Estate Portfolio.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
                We guide buyers, sellers, and investors across Mombasa, Diani, Kilifi, and nearby growth corridors with trusted local insight.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-30 mt-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:translate-y-[calc(100%-40px)]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
            <div className="grid overflow-hidden border border-zinc-200 bg-white shadow-xl lg:grid-cols-5">
              <article className="border-b border-zinc-200 bg-[#d7e9de] p-6 lg:col-span-2 lg:border-b-0 lg:border-r">
                <p className="text-xl font-medium leading-none text-zinc-900 lg:text-2xl">Build Your Dream</p>
                <h2 className="mt-3 text-4xl font-semibold leading-tight text-zinc-950 lg:text-5xl">
                  10 Years Of Undefeated Success
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-zinc-800">
                  Founded by Karim Real Estate industry veterans, we bring decades of
                  expertise in residential and commercial properties across Kenya&apos;s
                  most promising growth corridors.
                </p>
                <button className="mt-6 bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                  Work With Us
                </button>
              </article>

              <div className="grid sm:grid-cols-2 lg:col-span-3 lg:grid-cols-2">
                <article className="border-b border-zinc-200 p-6 lg:border-r">
                  <p className="text-4xl font-semibold leading-none text-zinc-950 lg:text-5xl">512+</p>
                  <p className="mt-3 max-w-[12rem] text-xl leading-7 text-zinc-800 lg:text-2xl">
                    Successfully Project Finished.
                  </p>
                </article>
                <article className="border-b border-zinc-200 p-6">
                  <p className="text-4xl font-semibold leading-none text-zinc-950 lg:text-5xl">10+</p>
                  <p className="mt-3 max-w-[12rem] text-xl leading-7 text-zinc-800 lg:text-2xl">
                    Years of experience with proud.
                  </p>
                </article>
                <article className="border-b border-zinc-200 p-6 lg:border-b-0 lg:border-r">
                  <p className="text-4xl font-semibold leading-none text-zinc-950 lg:text-5xl">1120+</p>
                  <p className="mt-3 max-w-[12rem] text-xl leading-7 text-zinc-800 lg:text-2xl">
                    Revenue in 2017 investment
                  </p>
                </article>
                <article className="p-6">
                  <p className="text-4xl font-semibold leading-none text-zinc-950 lg:text-5xl">1520+</p>
                  <p className="mt-3 max-w-[12rem] text-xl leading-7 text-zinc-800 lg:text-2xl">
                    Colleagues &amp; counting more daily
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pt-32">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">About Us</p>
          <h2 className="text-4xl font-semibold">A Real Estate Advisory Built on Trust</h2>
          <p className="max-w-3xl text-zinc-700">
            Karim Real Estate is a premium real estate practice focused on curation,
            market intelligence, and transaction excellence for private clients and
            institutional investors.
          </p>
        </div>

        <div className="h-[50px]" />

        <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-brand text-white">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#164a36_0%,#1e5a42_50%,#164a36_100%)]" />
          <div className="absolute inset-y-0 left-0 w-full bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center opacity-20 blur-[1.5px] lg:w-[68%]" />
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(180deg,rgba(18,63,46,0.5)_0%,rgba(18,63,46,0.8)_100%)] lg:w-[68%]" />

          <div className="relative grid min-h-[22rem] lg:min-h-[28rem] lg:grid-cols-[1.6fr_1fr]">
            <div className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                  I&apos;m Karim,
                  <br />
                  Real Estate Consultant
                </h3>
                <div className="mt-4 h-[2px] w-full max-w-xl bg-[#c9ac63]" />
                <p className="mt-6 text-base leading-7 text-white/90 sm:mt-8 sm:text-lg sm:leading-8">
                  Meet Karim, your trusted real estate partner. Whether you&apos;re buying,
                  selling, or investing, Karim is here to ensure a seamless and rewarding
                  experience for you. With extensive industry knowledge and a proven track
                  record of satisfied clients, rest assured your property goals are in
                  capable hands.
                </p>
                <p className="mt-6 text-lg font-semibold sm:text-xl">Karim</p>
                <p className="text-base text-white/90 sm:text-lg">CEO and Founder of Karim Real Estate</p>
              </div>
            </div>

            <div className="relative min-h-[18rem] sm:min-h-[22rem]">
              <Image
                src={KARIM_PORTRAIT}
                alt="Karim standing in office"
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </div>
          </div>
        </section>

        <section className="bg-zinc-100 px-6 py-10 sm:px-10 sm:py-12 lg:px-16">
          <div className="mx-auto max-w-5xl space-y-6">
            <p className="text-2xl font-medium leading-tight text-zinc-900 sm:text-3xl">
              As a seasoned professional with a diverse background in property
              management, real estate, facility coordination, and sales, Karim has
              cultivated a deep passion for the real estate industry.
            </p>
            <p className="text-lg leading-8 text-zinc-700 sm:text-2xl sm:leading-10">
              In addition to his expertise in property management, Karim brings over
              10 years of sales experience across various industries. This background
              has granted him invaluable insights into customer behavior, effective
              communication strategies, and the art of building lasting client
              relationships.
            </p>
          </div>
        </section>

      </div>
    </section>
  );
}
