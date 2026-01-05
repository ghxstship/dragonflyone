import type { ReactNode } from 'react';

export interface GalleryItem<T = unknown> {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  metadata?: Record<string, string | number>;
  data?: T;
}

export type GalleryLayout = "grid" | "masonry" | "list";
export type GallerySize = "small" | "medium" | "large";

export interface GalleryViewProps<T> {
  /** Items to display */
  items: GalleryItem<T>[];
  /** Layout mode */
  layout?: GalleryLayout;
  /** Item size */
  size?: GallerySize;
  /** Item click handler */
  onItemClick?: (item: GalleryItem<T>) => void;
  /** Custom item render */
  renderItem?: (item: GalleryItem<T>) => ReactNode;
  /** Show lightbox on click */
  enableLightbox?: boolean;
  /** Show item titles */
  showTitles?: boolean;
  /** Show item metadata */
  showMetadata?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Columns override */
  columns?: number;
}
