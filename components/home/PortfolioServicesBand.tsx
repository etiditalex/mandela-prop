import { Building2, Eye, LayoutGrid, LineChart } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Real Estate Due Diligence",
    description:
      "Structured reviews of title, compliance, and physical condition so you can transact with clarity.",
  },
  {
    icon: LayoutGrid,
    title: "Portfolio Services",
    description:
      "Acquisition, disposition, and balance-sheet planning aligned to your growth and risk targets.",
  },
  {
    icon: LineChart,
    title: "Real Estate Market Studies",
    description:
      "Demand drivers, pricing trends, and submarket benchmarks tailored to institutional and private clients.",
  },
  {
    icon: Eye,
    title: "Real Estate Valuation Services",
    description:
      "Independent, evidence-backed opinions of value for financing, reporting, and negotiation support.",
  },
] as const;

export function PortfolioServicesBand() {
  return (
    <section className="w-full bg-brand px-5 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14 xl:px-12">
      <div className="grid w-full gap-8 lg:min-h-[min(100vh,40rem)] lg:grid-cols-[minmax(0,38%)_minmax(0,1fr)] lg:gap-10 lg:gap-x-12">
        <div className="flex flex-col justify-center bg-white px-8 py-14 shadow-sm sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/80">
            Advisory
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-brand sm:text-4xl lg:text-[2.35rem] lg:leading-[1.12]">
            Karim Real Estate Portfolio
          </h2>
          <p className="mt-6 max-w-md text-pretty text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
            We pair on-the-ground execution in Kenya with institutional-grade research and
            documentation—so every mandate is supported from first conversation through closing.
          </p>
        </div>

        <div className="px-2 pb-2 pt-4 text-white sm:px-4 lg:flex lg:items-center lg:px-2 lg:py-6 xl:px-4">
          <div className="grid w-full gap-x-10 gap-y-12 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-14">
            {services.map(({ icon: Icon, title, description }) => (
              <div key={title} className="max-w-sm">
                <Icon className="h-7 w-7 text-white/95" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-5 text-lg font-semibold leading-snug text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/80">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
