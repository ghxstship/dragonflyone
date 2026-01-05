"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { duotoneImageVariants, duotoneImageObjectFitVariants } from "./DuotoneImage.variants.js";
import type { DuotoneImageProps, ImageWithOverlayProps } from "./DuotoneImage.types.js";

/**
 * DuotoneImage component - Enhanced image with duotone effects and loading states.
 * 
 * @example
 * ```tsx
 * <DuotoneImage
 *   src="/image.jpg"
 *   alt="Description"
 *   grayscale
 *   aspectRatio="16:9"
 *   showPlaceholder
 * />
 * ```
 */
export const DuotoneImage = forwardRef<HTMLImageElement, DuotoneImageProps>(
  function DuotoneImage(
    {
      src,
      alt,
      grayscale = true,
      highContrast = false,
      halftoneHover = false,
      aspectRatio = "auto",
      objectFit = "cover",
      objectPosition = "center",
      showPlaceholder = true,
      placeholderType = "geometric",
      onLoad,
      onError,
      invertOnHover = false,
      scaleOnHover = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    };

    return (
      <div
        className={duotoneImageVariants({
          aspectRatio,
          grayscale,
          highContrast,
          halftoneHover,
          invertOnHover,
          scaleOnHover,
          className,
        })}
        style={style}
      >
        {/* Loading placeholder */}
        {showPlaceholder && isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            {placeholderType === "geometric" && (
              <div className="w-full h-full bg-[var(--color-surface-muted)] flex items-center justify-center">
                <div className="w-spacing-16 h-spacing-16 border-4 border-[var(--color-text-primary)]" />
              </div>
            )}
            {placeholderType === "halftone" && (
              <div className="w-full h-full bg-[var(--color-pattern-halftone)] bg-[var(--color-pattern-halftone)]" />
            )}
            {placeholderType === "solid" && (
              <div className="w-full h-full bg-[var(--color-surface-muted)]" />
            )}
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-muted)]">
            <div className="text-center">
              <div className="w-spacing-12 h-spacing-12 mx-auto mb-spacing-2 border-2 border-[var(--color-text-primary)] flex items-center justify-center">
                <svg className="w-spacing-6 h-spacing-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-code text-mono-xs uppercase tracking-wider text-[var(--color-text-disabled)]">
                Image unavailable
              </span>
            </div>
          </div>
        )}

        {/* Actual image */}
        {!hasError && (
          <img
            ref={ref}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={clsx(
              duotoneImageObjectFitVariants({ objectFit }),
              isLoading && "opacity-0"
            )}
            style={{ objectPosition }}
            {...props}
          />
        )}

        {/* Halftone overlay on hover */}
        {halftoneHover && !hasError && (
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-[var(--color-pattern-halftone)] bg-[var(--color-pattern-halftone)]"
          />
        )}
      </div>
    );
  }
);

/**
 * ImageWithOverlay component - DuotoneImage with overlay content.
 * 
 * @example
 * ```tsx
 * <ImageWithOverlay
 *   src="/image.jpg"
 *   alt="Description"
 *   overlay={<div>Overlay content</div>}
 *   overlayPosition="bottom"
 *   overlayBackground="gradient"
 * />
 * ```
 */
export const ImageWithOverlay = forwardRef<HTMLDivElement, ImageWithOverlayProps>(
  function ImageWithOverlay(
    {
      overlay,
      overlayPosition = "bottom",
      overlayOnHover = false,
      overlayBackground = "gradient",
      className,
      ...imageProps
    },
    ref
  ) {
    const overlayPositionClasses = {
      top: "top-0 left-0 right-0",
      bottom: "bottom-0 left-0 right-0",
      center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      full: "inset-0",
    };

    const overlayBackgroundClasses = {
      gradient: overlayPosition === "top" 
        ? "bg-gradient-to-b from-[var(--color-surface-inverse)]/80 to-transparent"
        : overlayPosition === "bottom"
        ? "bg-gradient-to-t from-[var(--color-surface-inverse)]/80 to-transparent"
        : "bg-[var(--color-surface-inverse)]/60",
      solid: "bg-[var(--color-surface-inverse)]/70",
      none: "",
    };

    return (
      <div ref={ref} className={clsx("relative group", className)}>
        <DuotoneImage {...imageProps} />
        
        {overlay && (
          <div
            className={clsx(
              "absolute z-10 p-spacing-4 transition-opacity duration-300",
              overlayPositionClasses[overlayPosition],
              overlayBackgroundClasses[overlayBackground],
              overlayOnHover && "opacity-0 group-hover:opacity-100"
            )}
          >
            {overlay}
          </div>
        )}
      </div>
    );
  }
);
