"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ImageGalleryProps = HTMLAttributes<HTMLDivElement> & {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
};

export const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(
  function ImageGallery({ images, columns = 3, className, ...props }, ref) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const gridClasses = {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <>
        <div ref={ref} className={clsx("grid gap-4", gridClasses[columns], className)} {...props}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(image)}
              className="relative overflow-hidden bg-grey-900 aspect-square border-2 border-black group cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover grayscale contrast-125"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black z-[1400] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white text-4xl hover:opacity-70"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <div className="max-w-5xl w-full">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto grayscale contrast-125"
              />
              {selectedImage.caption && (
                <p className="mt-4 font-code text-[0.875rem] uppercase tracking-widest text-white text-center">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
);
