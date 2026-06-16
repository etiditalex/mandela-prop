"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

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

  if (uniqueImages.length === 0) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-sm bg-zinc-100 text-sm text-zinc-500 sm:h-[460px]">
        No images available
      </div>
    );
  }

  const activeImage = uniqueImages[activeIndex] ?? uniqueImages[0];

  const lightbox =
    lightboxOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col bg-black"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photos`}
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm font-medium text-white">
                {activeIndex + 1} / {uniqueImages.length}
              </p>
              <button
                type="button"
                onClick={closeLightbox}
                className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                aria-label="Close fullscreen gallery"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {uniqueImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    disabled={activeIndex === 0}
                    className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:left-4"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    disabled={activeIndex === uniqueImages.length - 1}
                    className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:right-4"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              ) : null}

              <div className="relative h-full w-full px-12 py-2 sm:px-16">
                <Image
                  key={activeImage}
                  src={activeImage}
                  alt={`${title} photo ${activeIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {uniqueImages.length > 1 ? (
              <div className="shrink-0 border-t border-white/10 px-4 py-3 sm:px-6">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {uniqueImages.map((image, index) => (
                    <button
                      key={`${image}-fullscreen-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={clsx(
                        "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition",
                        index === activeIndex ? "border-white" : "border-transparent opacity-70 hover:opacity-100",
                      )}
                      aria-label={`Show photo ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt=""
                        width={160}
                        height={110}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-white/60">
                  Tap thumbnails or use arrow keys to browse
                </p>
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-sm text-left"
          aria-label={`Open ${title} photo gallery fullscreen`}
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
            View fullscreen ({uniqueImages.length})
          </span>
        </button>

        {uniqueImages.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {uniqueImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => openLightbox(index)}
                className={clsx(
                  "relative h-24 w-32 shrink-0 cursor-zoom-in overflow-hidden rounded-sm border-2 transition",
                  index === activeIndex ? "border-brand" : "border-transparent hover:border-zinc-300",
                )}
                aria-label={`View photo ${index + 1} fullscreen`}
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

      {lightbox}
    </>
  );
}
