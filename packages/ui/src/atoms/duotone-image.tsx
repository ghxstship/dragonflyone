'use client';

import { forwardRef, useState, ImgHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface DuotoneImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Apply grayscale filter */
  grayscale?: boolean;
  /** Apply high contrast filter */
  highContrast?: boolean;
  /** Apply halftone overlay on hover */
  halftoneHover?: boolean;
  /** Aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '21:9' | 'auto';
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position */
  objectPosition?: string;
  /** Show loading placeholder */
  showPlaceholder?: boolean;
  /** Placeholder type */
  placeholderType?: 'geometric' | 'halftone' | 'solid';
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Invert colors on hover */
  invertOnHover?: boolean;
  /** Scale on hover */
  scaleOnHover?: boolean;
}

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:2': 'aspect-[3/2]',
  '2:3': 'aspect-[2/3]',
  '9:16': 'aspect-[9/16]',
  '21:9': 'aspect-[21/9]',
  'auto': '',
};

const objectFitClasses = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

export const DuotoneImage = forwardRef<HTMLImageElement, DuotoneImageProps>(
  function DuotoneImage(
    {
      src,
      alt,
      grayscale = true,
      highContrast = false,
      halftoneHover = false,
      aspectRatio = 'auto',
      objectFit = 'cover',
      objectPosition = 'center',
      showPlaceholder = true,
      placeholderType = 'geometric',
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

    const filterClasses = clsx(
      grayscale && 'grayscale',
      highContrast && 'contrast-125 brightness-110'
    );

    const hoverClasses = clsx(
      invertOnHover && 'hover:invert',
      scaleOnHover && 'hover:scale-105',
      halftoneHover && 'hover:opacity-90'
    );

    return (
      <div
        className={clsx(
          'relative overflow-hidden bg-grey-200',
          aspectRatioClasses[aspectRatio],
          className
        )}
        style={style}
      >
        {/* Loading placeholder */}
        {showPlaceholder && isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            {placeholderType === 'geometric' && (
              <div className="w-full h-full bg-grey-200 flex items-center justify-center">
                <div className="w-spacing-16 h-spacing-16 border-4 border-black" />
              </div>
            )}
            {placeholderType === 'halftone' && (
              <div 
                className="w-full h-full bg-halftone bg-halftone"
              />
            )}
            {placeholderType === 'solid' && (
              <div className="w-full h-full bg-grey-300" />
            )}
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-grey-200">
            <div className="text-center">
              <div className="w-spacing-12 h-spacing-12 mx-auto mb-spacing-2 border-2 border-black flex items-center justify-center">
                <svg className="w-spacing-6 h-spacing-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-code text-mono-xs uppercase tracking-wider text-grey-600">
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
              'w-full h-full transition-all duration-300',
              objectFitClasses[objectFit],
              filterClasses,
              hoverClasses,
              isLoading && 'opacity-0'
            )}
            style={{ objectPosition }}
            {...props}
          />
        )}

        {/* Halftone overlay on hover */}
        {halftoneHover && !hasError && (
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-halftone bg-halftone"
          />
        )}
      </div>
    );
  }
);

export interface ImageWithOverlayProps extends DuotoneImageProps {
  /** Overlay content */
  overlay?: React.ReactNode;
  /** Overlay position */
  overlayPosition?: 'top' | 'bottom' | 'center' | 'full';
  /** Show overlay on hover only */
  overlayOnHover?: boolean;
  /** Overlay background */
  overlayBackground?: 'gradient' | 'solid' | 'none';
}

export const ImageWithOverlay = forwardRef<HTMLDivElement, ImageWithOverlayProps>(
  function ImageWithOverlay(
    {
      overlay,
      overlayPosition = 'bottom',
      overlayOnHover = false,
      overlayBackground = 'gradient',
      className,
      ...imageProps
    },
    ref
  ) {
    const overlayPositionClasses = {
      top: 'top-0 left-0 right-0',
      bottom: 'bottom-0 left-0 right-0',
      center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      full: 'inset-0',
    };

    const overlayBackgroundClasses = {
      gradient: overlayPosition === 'top' 
        ? 'bg-gradient-to-b from-black/80 to-transparent'
        : overlayPosition === 'bottom'
        ? 'bg-gradient-to-t from-black/80 to-transparent'
        : 'bg-black/60',
      solid: 'bg-black/70',
      none: '',
    };

    return (
      <div ref={ref} className={clsx('relative group', className)}>
        <DuotoneImage {...imageProps} />
        
        {overlay && (
          <div
            className={clsx(
              'absolute z-10 p-spacing-4 transition-opacity duration-300',
              overlayPositionClasses[overlayPosition],
              overlayBackgroundClasses[overlayBackground],
              overlayOnHover && 'opacity-0 group-hover:opacity-100'
            )}
          >
            {overlay}
          </div>
        )}
      </div>
    );
  }
);
