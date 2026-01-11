/**
 * Experience Hero Component
 * Full-screen hero with image gallery and breadcrumbs
 */

'use client';

import React, { useState } from 'react';
import type { ExperienceHeroProps } from './types';
import './experience-hero.css';

interface ExperienceHeroFullProps extends ExperienceHeroProps {
  onImageClick?: (index: number) => void;
}

export function ExperienceHero({
  experience,
  onImageClick,
}: ExperienceHeroFullProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = experience.media || [];

  const handlePrevious = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImage(index);
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(currentImage);
    }
  };

  if (!images.length) {
    return (
      <div className="experience-hero experience-hero--no-image">
        <div className="experience-hero__placeholder">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <section className="experience-hero">
      {/* Main Image */}
      <div className="experience-hero__main">
        <img
          src={images[currentImage].url}
          alt={images[currentImage].alt || experience.title}
          className="experience-hero__image"
          onClick={handleImageClick}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              className="experience-hero__nav experience-hero__nav--prev"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="experience-hero__nav experience-hero__nav--next"
              onClick={handleNext}
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="experience-hero__counter">
          {currentImage + 1} / {images.length}
        </div>

        {/* Badges */}
        {experience.badges && experience.badges.length > 0 && (
          <div className="experience-hero__badges">
            {experience.badges.map((badge) => (
              <span
                key={badge.id}
                className={`experience-hero__badge experience-hero__badge--${badge.variant}`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="experience-hero__thumbnails">
          <div className="experience-hero__thumbnails-wrapper">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={image.id}
                className={`experience-hero__thumbnail ${
                  index === currentImage
                    ? 'experience-hero__thumbnail--active'
                    : ''
                }`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image.thumbnail || image.url}
                  alt={image.alt || `Image ${index + 1}`}
                />
              </button>
            ))}
            {images.length > 8 && (
              <button
                className="experience-hero__thumbnail experience-hero__thumbnail--more"
                onClick={handleImageClick}
                aria-label={`View all ${images.length} images`}
              >
                <span>+{images.length - 8}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb Overlay */}
      <div className="experience-hero__breadcrumb">
        <a href="/" className="experience-hero__breadcrumb-link">
          Home
        </a>
        <span className="experience-hero__breadcrumb-separator">/</span>
        <a
          href={`/category/${experience.category}`}
          className="experience-hero__breadcrumb-link"
        >
          {experience.category}
        </a>
        <span className="experience-hero__breadcrumb-separator">/</span>
        <span className="experience-hero__breadcrumb-current">
          {experience.title}
        </span>
      </div>
    </section>
  );
}

ExperienceHero.displayName = 'ExperienceHero';
