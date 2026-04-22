import Image from "next/image";
import Link from "next/link";
import { Send } from "lucide-react";

const SKYLINE =
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=80";

export function FutureRealEstateCta() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={SKYLINE}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />
        <div
          className="absolute inset-0 bg-brand/70 backdrop-blur-[2px] sm:bg-brand/65 sm:backdrop-blur-md"
          aria-hidden
        />
      </div>

      <div className="relative z-10 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
          <div className="max-w-3xl">
            <Send
              className="h-7 w-7 text-white"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="mt-6 text-sm font-semibold tracking-wide text-white">
              Client-Centric Approach
            </p>
            <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              Let&apos;s Build the Future of Real Estate Together.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/90 sm:text-lg sm:leading-8">
              Whether you&apos;re looking to invest in premium properties or develop your own real
              estate portfolio, Karim Real Estate Portfolio is here to guide you. With offices in
              Australia and the UAE, we offer localized support with a global perspective.
            </p>
          </div>

          <div className="shrink-0 lg:pb-1">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand shadow-lg transition hover:bg-white/95 sm:text-sm"
            >
              Free consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
