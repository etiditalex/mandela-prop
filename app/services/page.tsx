import { Metadata } from "next";
import { BarChart3, BriefcaseBusiness, Building2, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore Karim Real Estate services for buyers, sellers, and investors.",
};

export default function ServicesPage() {
  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-brand text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#123f2e_0%,#1a5a42_52%,#123f2e_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 lg:w-[70%]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(180deg,rgba(18,63,46,0.2)_0%,rgba(18,63,46,0.8)_100%)] lg:w-[70%]" />

        <div className="relative mx-auto flex min-h-[15rem] w-full max-w-[88rem] items-end px-4 pb-6 sm:min-h-[20rem] sm:px-8 sm:pb-12 lg:min-h-[26rem] lg:px-12 lg:pb-14">
          <div className="w-full max-w-3xl">
            <p className="text-base font-semibold text-white/95 sm:text-lg">What We Offer</p>
            <div className="mt-3 h-[2px] w-full bg-[#d8c17a]" />
            <h1 className="mt-6 text-3xl font-semibold leading-none sm:mt-8 sm:text-6xl">Services</h1>
          </div>
        </div>
      </div>

      <section className="bg-[#d7e9de] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-zinc-900">How We Can Help</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              We Deliver Measurable Results
            </h2>
            <div className="mt-6 h-[3px] w-14 bg-zinc-900" />
            <p className="mt-6 text-base leading-7 text-zinc-900 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10">
              At Karim Real Estate, we pride ourselves on our commitment to delivering
              personalized solutions tailored to each client&apos;s unique needs.
              Whether you&apos;re a seasoned investor or a first-time buyer, our team is
              dedicated to helping you achieve your real estate goals.
            </p>
          </div>

          <div className="space-y-7 sm:space-y-8">
            <article className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-zinc-900 sm:h-7 sm:w-7" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-950 sm:text-xl lg:text-2xl">
                  Evaluating large and diverse portfolios
                </h3>
                <p className="mt-2 text-base leading-7 text-zinc-900 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
                  We consider each asset&apos;s unique characteristics and market behavior.
                  This comprehensive approach supports confident decision-making and
                  optimal portfolio management. We evaluate asset mix, performance
                  trends, neighborhood growth indicators, and liquidity potential to
                  build strategies that remain resilient in changing market
                  conditions. Our process is designed to help clients preserve value,
                  reduce risk exposure, and unlock stronger long-term returns.
                </p>
              </div>
            </article>

            <article className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-zinc-900 sm:h-7 sm:w-7" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-950 sm:text-xl lg:text-2xl">
                  Performing single-property analysis
                </h3>
                <p className="mt-2 text-base leading-7 text-zinc-900 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
                  We assess each property in depth to uncover opportunities, potential
                  risks, and strategic actions that improve long-term value. This
                  detailed analysis examines location dynamics, market demand, pricing
                  behavior, and financial performance so every recommendation is backed
                  by practical data. The result is clear, actionable insight that
                  helps clients make smarter acquisition, holding, or exit decisions.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f4f4] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-2 md:gap-10">
          <article className="space-y-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 text-zinc-900 sm:h-14 sm:w-14">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-brand sm:text-4xl lg:text-5xl">
              Real Estate
              <br />
              Due Diligence
            </h2>
            <p className="max-w-xl text-base leading-7 text-zinc-700 sm:text-lg sm:leading-9">
              We ensure your investment is sound with comprehensive real estate due
              diligence, covering every detail from legal checks to property
              inspections and risk analysis.
            </p>
            <div className="h-[2px] w-full bg-zinc-800/80" />
          </article>

          <article className="space-y-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 text-zinc-900 sm:h-14 sm:w-14">
              <BriefcaseBusiness className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-brand sm:text-4xl lg:text-5xl">
              Portfolio
              <br />
              Services
            </h2>
            <p className="max-w-xl text-base leading-7 text-zinc-700 sm:text-lg sm:leading-9">
              We optimize and grow your investments with tailored real estate
              portfolio services designed to maximize returns and minimize risk.
              Let&apos;s build your next stage of growth.
            </p>
            <div className="h-[2px] w-full bg-zinc-800/80" />
          </article>

          <article className="space-y-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 text-zinc-900 sm:h-14 sm:w-14">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-brand sm:text-4xl lg:text-5xl">
              Real Estate
              <br />
              Market Studies
            </h2>
            <p className="max-w-xl text-base leading-7 text-zinc-700 sm:text-lg sm:leading-9">
              Real estate market studies provide in-depth insights into pricing,
              demand trends, development activity, and neighborhood dynamics to
              support confident investment decisions.
            </p>
            <div className="h-[2px] w-full bg-zinc-800/80" />
          </article>
        </div>
      </section>

    </section>
  );
}
