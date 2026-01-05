"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import { imageGalleryVariants, imageVariants } from "./ImageGallery.variants.js";
import type { 
  ImageGalleryProps,
  GalleryImage
} from "./ImageGallery.types.js";

/**
 * ImageGallery component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Responsive grid layout
 * - Pop art hover effects with lift and shadows
 * - Grayscale filter with contrast
 * - Lightbox modal for full-size viewing
 * - Bold 2px borders and rounded corners
 */
export const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(
  function ImageGallery({ images, columns = 3, className, ...props }, ref) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    return (
      <>
        <div ref={ref} className={clsx(imageGalleryVariants({ columns }), className)} {...props}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={imageVariants()}
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
            className="fixed inset-0 bg-black z-modal flex items-center justify-center p-spacing-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              className="absolute top-spacing-4 right-spacing-4 text-white text-h2-sm hover:opacity-70"
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
                <p className="mt-4 font-code text-mono-md uppercase tracking-widest text-white text-center">
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

export default ImageGallery;
