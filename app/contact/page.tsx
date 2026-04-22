import { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Speak with our advisors for private viewings and investment guidance.",
};

export default function ContactPage() {
  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-brand text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#123f2e_0%,#1a5a42_52%,#123f2e_100%)]" />
        <div className="absolute inset-y-0 left-0 w-[65%] bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-18" />
        <div className="absolute inset-y-0 left-0 w-[65%] bg-[linear-gradient(180deg,rgba(18,63,46,0.2)_0%,rgba(18,63,46,0.78)_100%)]" />
        <div className="absolute inset-y-0 left-[65%] w-[35%] bg-[#0e3a2a]" />

        <div className="relative mx-auto flex min-h-[21rem] w-full max-w-[88rem] items-end px-4 pb-8 sm:min-h-[26rem] sm:px-8 sm:pb-10 lg:min-h-[33rem] lg:px-12 lg:pb-14">
          <div className="w-full max-w-3xl">
            <p className="text-base font-semibold text-white/95 sm:text-lg">Let&apos;s Talk</p>
            <div className="mt-3 h-[2px] w-full bg-[#d8c17a]" />
            <h1 className="mt-8 text-4xl font-semibold leading-none sm:mt-9 sm:text-6xl">Contact</h1>
          </div>
        </div>
      </div>

      <section className="bg-[#f4f4f4] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-md space-y-5 sm:space-y-6">
            <h2 className="text-4xl font-semibold leading-none text-zinc-950 sm:text-6xl">
              Get In Touch
            </h2>
            <div className="h-[3px] w-14 bg-zinc-900" />
            <p className="text-lg leading-8 text-zinc-900 sm:text-2xl sm:leading-[2.6rem]">
              Join us today and discover a new standard of real estate excellence. Let us
              help you grow your property portfolio and achieve success in local and
              international markets.
            </p>
          </div>

          <form className="space-y-6 sm:space-y-7">
            <div className="space-y-2">
              <label className="text-2xl font-semibold leading-none text-zinc-800 sm:text-[2rem]" htmlFor="firstName">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    id="firstName"
                    type="text"
                    className="h-12 w-full border border-zinc-200 bg-white px-3 text-base outline-none focus:border-brand sm:h-14 sm:text-lg"
                  />
                  <p className="mt-1 text-sm text-zinc-500">First</p>
                </div>
                <div>
                  <input
                    id="lastName"
                    type="text"
                    className="h-12 w-full border border-zinc-200 bg-white px-3 text-base outline-none focus:border-brand sm:h-14 sm:text-lg"
                  />
                  <p className="mt-1 text-sm text-zinc-500">Last</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-2xl font-semibold leading-none text-zinc-800 sm:text-[2rem]" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="h-12 w-full border border-zinc-200 bg-white px-3 text-base outline-none focus:border-brand sm:h-14 sm:text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-2xl font-semibold leading-none text-zinc-800 sm:text-[2rem]" htmlFor="message">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full border border-zinc-200 bg-white p-3 text-base outline-none focus:border-brand sm:text-lg"
              />
            </div>

            <Button type="submit" className="h-11 rounded-none bg-brand px-8 text-sm font-semibold uppercase tracking-wide text-white hover:bg-brand/90 sm:h-12">
              Send
            </Button>
          </form>
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-brand px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto grid w-full max-w-[88rem] overflow-hidden border border-white/20 bg-[#d7e9de] lg:grid-cols-2">
          <div className="min-h-[16rem] sm:min-h-[20rem] lg:min-h-[32rem]">
            <iframe
              title="Karim Real Estate office location"
              src="https://www.google.com/maps?q=Bofa+Road+Kilifi&output=embed"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="flex items-center bg-[#d7e9de] p-6 sm:p-10 lg:p-14">
            <div className="max-w-xl text-zinc-900">
              <h2 className="text-4xl font-semibold leading-none sm:text-6xl">Location</h2>
              <div className="mt-5 h-[2px] w-12 bg-brand" />
              <p className="mt-6 text-base leading-7 sm:text-2xl sm:leading-10">
                Join us today and discover a new standard of real estate excellence.
                Let us help you grow your property portfolio and achieve success in
                local and international markets.
              </p>
              <ul className="mt-8 space-y-3 text-sm sm:space-y-4 sm:text-xl">
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-brand" />
                  <span>+254 700 000 000</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-brand" />
                  <span>hello@karimrealestate.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-brand" />
                  <span>Kilifi, Bofa Road</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f4f4] px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-xl font-medium leading-tight text-zinc-800 sm:text-2xl">
              More
              <br />
              Mission &amp;
              <br />
              Vision
            </p>
          </div>

          <div className="space-y-10">
            <article>
              <h2 className="text-4xl font-semibold leading-none text-zinc-950 sm:text-6xl">
                Mission
              </h2>
              <p className="mt-5 text-lg font-semibold leading-8 text-zinc-900 sm:text-2xl sm:leading-9">
                Karim Real Estate is your trusted real estate partner. Whether you&apos;re
                buying, selling, or investing.
              </p>
              <p className="mt-5 text-base leading-7 text-zinc-800 sm:text-2xl sm:leading-10">
                Founded by experienced industry professionals, Karim Real Estate is
                poised to revolutionize the way you manage your properties. Our
                team&apos;s deep understanding of local and international real estate
                markets enables us to provide unparalleled service and expert
                guidance.
              </p>
            </article>

            <div className="h-[2px] w-full bg-zinc-700/70" />

            <article>
              <h2 className="text-4xl font-semibold leading-none text-zinc-950 sm:text-6xl">
                Vision
              </h2>
              <p className="mt-5 text-lg font-semibold leading-8 text-zinc-900 sm:text-2xl sm:leading-9">
                We deliver measurable results as a team.
              </p>
              <p className="mt-5 text-base leading-7 text-zinc-800 sm:text-2xl sm:leading-10">
                We are committed to delivering personalized solutions tailored to
                each client&apos;s unique objectives, while setting a new benchmark in
                service quality, transparency, and long-term value creation.
              </p>
            </article>
          </div>
        </div>
      </section>

    </section>
  );
}
