import type { HTMLAttributes } from 'react';

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
