import type { ImgHTMLAttributes } from 'react';

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

export interface DuotoneImageVariants {
  /** Aspect ratio */
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '21:9' | 'auto';
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Grayscale filter */
  grayscale?: boolean;
  /** High contrast filter */
  highContrast?: boolean;
  /** Halftone hover effect */
  halftoneHover?: boolean;
  /** Invert on hover */
  invertOnHover?: boolean;
  /** Scale on hover */
  scaleOnHover?: boolean;
  /** Additional CSS classes */
  className?: string;
}
