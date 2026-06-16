"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import clsx from "clsx";

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const uniqueImages = useMemo(
    () => images.filter((url, index) => Boolean(url) && images.indexOf(url) === index),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const showPrevious = () => {
    setActiveIndex((current) => Math.max(0, current - 1));
  };

  const showNext = () => {
    setActiveIndex((current) => Math.min(uniqueImages.length - 1, current + 1));
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    slideRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeIndex, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => Math.min(uniqueImages.length - 1, current + 1));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, uniqueImages.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!lightboxOpen || !container) return;

    const onScroll = () => {
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length === 0) return;

      const midpoint = container.scrollTop + container.clientHeight / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slides.forEach((slide, index) => {
        const slideMid = slide.offsetTop + slide.offsetHeight / 2;
        const distance = Math.abs(slideMid - midpoint);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [lightboxOpen, uniqueImages.length]);

  if (uniqueImages.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-sm bg-zinc-100 text-sm text-zinc-500 sm:h-[460px]">
        No images available
      </div>
    );
  }

  const activeImage = uniqueImages[activeIndex] ?? uniqueImages[0];

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="group relative block w-full overflow-hidden rounded-sm text-left"
          aria-label={`Open ${title} photo gallery`}
        >
          <Image
            src={activeImage}
            alt={title}
            width={1600}
            height={900}
            className="h-[360px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-[460px]"
            priority
          />
          <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            <ZoomIn size={14} />
            View photos ({uniqueImages.length})
          </span>
        </button>

        {uniqueImages.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  openLightbox(index);
                }}
                className={clsx(
                  "relative h-24 w-32 shrink-0 overflow-hidden rounded-sm border-2 transition",
                  index === activeIndex ? "border-brand" : "border-transparent hover:border-zinc-300",
                )}
                aria-label={`View photo ${index + 1} of ${uniqueImages.length}`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  width={320}
                  height={220}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/95" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-4 py-4 sm:px-6">
            <p className="text-sm font-medium text-white">
              {activeIndex + 1} / {uniqueImages.length}
            </p>
            <button
              type="button"
              onClick={closeLightbox}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X size={22} />
            </button>
          </div>

          {uniqueImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:left-6"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={showNext}
                disabled={activeIndex === uniqueImages.length - 1}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:right-6"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          ) : null}

          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory"
          >
            {uniqueImages.map((image, index) => (
              <div
                key={`${image}-lightbox-${index}`}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className="flex min-h-full snap-start items-center justify-center px-4 py-20 sm:px-10"
              >
                <Image
                  src={image}
                  alt={`${title} photo ${index + 1}`}
                  width={1800}
                  height={1200}
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-white/70">
            Scroll or use arrow keys for more photos
          </p>
        </div>
      ) : null}
    </>
  );
}
