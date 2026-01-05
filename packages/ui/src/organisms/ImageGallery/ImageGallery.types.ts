import type { HTMLAttributes } from 'react';

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ImageGalleryProps = HTMLAttributes<HTMLDivElement> & {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
};
