import Image from "next/image";

const FIRM_IMAGE =
  "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1600/v1776763528/mandela_2_xvktej.jpg";

export function KarimFirmSplit() {
  return (
    <section className="grid bg-white lg:grid-cols-2" aria-labelledby="karim-firm-heading">
      <div className="relative min-h-[22rem] sm:min-h-[28rem] lg:min-h-[36rem]">
        <Image
          src={FIRM_IMAGE}
          alt="Karim standing in the office"
          fill
          className="object-cover object-top"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>

      <div className="flex items-center px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
        <div className="max-w-xl">
          <h2
            id="karim-firm-heading"
            className="text-3xl font-bold uppercase leading-[1.08] tracking-tight text-black sm:text-4xl lg:text-5xl"
          >
            Making Better Real Estate Decisions
          </h2>
          <div className="mt-8 space-y-5 text-sm leading-7 text-black/70 sm:text-base sm:leading-8">
            <p>
              Karim Real Estate is a premium real estate practice focused on curation, market
              intelligence, and transaction excellence for private clients and institutional
              investors. We guide buyers, sellers, and investors across Mombasa, Diani, Kilifi, and
              nearby growth corridors with trusted local insight.
            </p>
            <p>
              Meet Karim, your trusted real estate partner. Whether you&apos;re buying, selling, or
              investing, Karim is here to ensure a seamless and rewarding experience for you. With
              extensive industry knowledge and a proven track record of satisfied clients, your
              property goals are in capable hands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
