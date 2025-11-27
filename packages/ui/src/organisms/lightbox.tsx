"use client";

import { forwardRef, useState, useEffect, useCallback, HTMLAttributes } from "react";
import clsx from "clsx";

export interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface LightboxProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of images to display */
  images: LightboxImage[];
  /** Currently selected image index */
  currentIndex?: number;
  /** Whether lightbox is open */
  open: boolean;
  /** Callback when lightbox closes */
  onClose: () => void;
  /** Callback when image changes */
  onIndexChange?: (index: number) => void;
  /** Show image counter */
  showCounter?: boolean;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Enable swipe gestures */
  enableSwipe?: boolean;
  /** Apply B&W filter to images */
  grayscale?: boolean;
  /** Show thumbnails */
  showThumbnails?: boolean;
  /** Animation style */
  animation?: "fade" | "slide" | "zoom";
}

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
      ...props
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

    if (!open) return null;

    const currentImage = images[activeIndex];

    return (
      <div
        ref={ref}
        className={clsx(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-black",
          className
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        {...props}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-grey-200 transition-colors"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Counter */}
        {showCounter && images.length > 1 && (
          <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white text-black font-mono text-mono-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Previous button */}
        {showNavigation && images.length > 1 && (
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-grey-200 transition-colors"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-grey-200 transition-colors"
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
              <div className="w-12 h-12 border-4 border-white border-t-transparent animate-spin" />
            </div>
          )}

          {/* Image */}
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
                <h3 className="font-heading text-h5-md uppercase tracking-widest">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.caption && (
                <p className="mt-2 font-body text-grey-400 max-w-lg">
                  {currentImage.caption}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50">
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
    );
  }
);

export default Lightbox;
