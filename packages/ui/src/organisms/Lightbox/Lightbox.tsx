"use client";

import { forwardRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { Modal } from "../Modal/index.js";
import type { 
  LightboxProps 
} from "./Lightbox.types.js";

/**
 * Lightbox component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Full-screen image viewer
 * - Keyboard navigation (arrow keys, escape)
 * - Touch/swipe gestures
 * - Image counter and navigation
 * - Thumbnail strip
 * - Multiple animation styles
 * - Grayscale filter option
 * - Loading states
 */
export const Lightbox = forwardRef<HTMLDivElement, LightboxProps>(
  function Lightbox(
    {
      images,
      currentIndex = 0,
      open,
      onClose,
      onIndexChange,
      showCounter = true,
      showNavigation = true,
      enableKeyboard = true,
      enableSwipe = true,
      grayscale = false,
      showThumbnails = false,
      animation = "fade",
      className,
    },
    ref
  ) {
    const [activeIndex, setActiveIndex] = useState(currentIndex);
    const [isLoading, setIsLoading] = useState(true);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    useEffect(() => {
      setActiveIndex(currentIndex);
    }, [currentIndex]);

    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    const goToNext = useCallback(() => {
      const newIndex = (activeIndex + 1) % images.length;
      setActiveIndex(newIndex);
      onIndexChange?.(newIndex);
      setIsLoading(true);
    }, [activeIndex, images.length, onIndexChange]);

    const goToPrev = useCallback(() => {
      const newIndex = (activeIndex - 1 + images.length) % images.length;
      setActiveIndex(newIndex);
      onIndexChange?.(newIndex);
      setIsLoading(true);
    }, [activeIndex, images.length, onIndexChange]);

    const goToIndex = useCallback(
      (index: number) => {
        setActiveIndex(index);
        onIndexChange?.(index);
        setIsLoading(true);
      },
      [onIndexChange]
    );

    // Keyboard navigation
    useEffect(() => {
      if (!open || !enableKeyboard) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "Escape":
            onClose();
            break;
          case "ArrowRight":
            goToNext();
            break;
          case "ArrowLeft":
            goToPrev();
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, enableKeyboard, onClose, goToNext, goToPrev]);

    // Touch handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
      if (!enableSwipe) return;
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
      if (!enableSwipe) return;
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!enableSwipe || !touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrev();
      }
    };

    const currentImage = images[activeIndex];

    // Header with counter
    const headerContent = showCounter && images.length > 1 ? (
      <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-surface-primary text-text-primary font-mono text-sm">
        {activeIndex + 1} / {images.length}
      </div>
    ) : null;

    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        size="xl"
        showClose
        className={className}
      >
        {/* Touch handlers wrapper */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Counter */}
          {headerContent}

          {/* Previous button */}
          {showNavigation && images.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-surface-primary text-text-primary hover:bg-muted transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {showNavigation && images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-surface-primary text-text-primary hover:bg-muted transition-colors"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Main image container */}
          <div className="relative max-w-[90vw] max-h-[80vh] flex flex-col items-center">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Image - using img tag as this is a UI library component that may be used outside Next.js */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className={clsx(
                "max-w-full max-h-[70vh] object-contain transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
                grayscale && "grayscale",
                animation === "fade" && "transition-opacity",
                animation === "zoom" && "transition-transform"
              )}
              onLoad={() => setIsLoading(false)}
            />

            {/* Caption */}
            {(currentImage.title || currentImage.caption) && (
              <div className="mt-4 text-center text-white">
                {currentImage.title && (
                  <h3 className="font-heading text-lg uppercase tracking-widest">
                    {currentImage.title}
                  </h3>
                )}
                {currentImage.caption && (
                  <p className="mt-2 font-body text-text-muted max-w-lg">
                    {currentImage.caption}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {showThumbnails && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 p-2 bg-black/50">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={clsx(
                    "w-16 h-16 overflow-hidden transition-all",
                    index === activeIndex
                      ? "ring-2 ring-white"
                      : "opacity-50 hover:opacity-100"
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt=""
                    className={clsx(
                      "w-full h-full object-cover",
                      grayscale && "grayscale"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  }
);

export default Lightbox;
