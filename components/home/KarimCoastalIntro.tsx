import Image from "next/image";

/** Coastal Kenya–style land / shoreline (Unsplash). */
const COASTAL_LAND =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80";

export function KarimCoastalIntro() {
  return (
    <section
      className="relative z-40 -mt-[80px] w-full bg-brand"
      aria-labelledby="karim-coastal-heading"
    >
      {/* Horizontal padding: brand shows at viewport edges; image column has inset so green frames the photo (especially on the left). */}
      <div className="flex w-full flex-col px-5 sm:px-8 md:min-h-[min(40rem,85vh)] md:flex-row md:items-stretch md:px-10 lg:px-12 xl:px-16">
        <div className="relative z-10 w-full shrink-0 bg-brand md:w-[42%] md:max-w-none lg:w-[40%]">
          <div className="p-3 sm:p-4 sm:pl-4 md:p-4 md:pl-7 md:pr-4 md:pt-4 md:pb-5 lg:pl-8 lg:pr-6 lg:py-5 xl:pl-10 xl:pr-7 xl:py-6">
            <div className="relative -mt-[80px]">
              <div className="relative aspect-[3/4] min-h-[16rem] w-full overflow-hidden sm:min-h-[18rem] md:aspect-auto md:min-h-[min(70vh,38rem)]">
                <Image
                  src={COASTAL_LAND}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 768px) 42vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex min-h-[20rem] w-full min-w-0 flex-1 flex-col justify-center bg-brand px-6 py-12 text-white shadow-[inset_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-[2px] sm:px-10 sm:py-14 md:min-h-0 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <p className="text-[11px] font-bold uppercase leading-relaxed tracking-[0.2em] text-white/90 sm:text-xs">
            Whether you&apos;re buying, selling, or investing.
          </p>
          <h2
            id="karim-coastal-heading"
            className="mt-5 text-balance text-2xl font-black uppercase leading-[1.06] tracking-[0.04em] text-white sm:text-3xl lg:text-[2rem] lg:leading-[1.08] xl:text-[2.35rem]"
          >
            Karim Real Estate is your trusted coastal Kenya partner.
          </h2>
          <p className="mt-7 text-base font-bold text-white sm:text-lg">
            Introducing Karim Real Estate Portfolio.
          </p>
          <div className="mt-6 max-w-xl space-y-4 text-sm leading-7 text-white/90 sm:text-base sm:leading-8">
            <p>
              Karim Real Estate is rooted in Kenya&apos;s coastal region—Mombasa, Diani, Kilifi, and
              surrounding corridors—where oceanfront land, hospitality-driven growth, and
              residential demand come together. We help you evaluate shoreline plots, titled
              acreage, and homes with documentation you can trust.
            </p>
            <p>
              Whether you are buying a first home, selling a legacy asset, or building an investment
              portfolio, our advisors combine on-the-ground knowledge with a disciplined process so
              every decision reflects the realities of the coast—not generic templates from elsewhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
