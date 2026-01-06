"use client";

import { forwardRef } from "react";
import { 
  projectCardVariants,
  projectCardImageContainerVariants,
  projectCardImageVariants,
  projectCardImageOverlayVariants,
  projectCardContentVariants,
  projectCardTitleVariants,
  projectCardMetadataVariants,
  projectCardTagsContainerVariants,
  projectCardTagVariants 
} from "./ProjectCard.variants.js";
import type { ProjectCardProps } from "./ProjectCard.types.js";

/**
 * ProjectCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Project card with image and metadata
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ProjectCard
 *   title="Amazing Project"
 *   image="/project-image.jpg"
 *   metadata="Web Design • 2024"
 *   tags={["React", "TypeScript"]}
 *   inverted={false}
 * />
 * ```
 */
export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  function ProjectCard({ 
    title, 
    image, 
    imageAlt, 
    metadata, 
    tags, 
    href, 
    onClick, 
    inverted = false,
    className, 
    ...props 
  }, ref) {
    // Determine if card is interactive
    const isInteractive = !!(href || onClick);

    // Handle click events
    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    // Handle key events for accessibility
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
        e.preventDefault();
        handleClick();
      }
    };

    // Create the card content
    const Content = (
      <>
        {/* Image Container */}
        <div className={projectCardImageContainerVariants({})}>
          <img
            src={image}
            alt={imageAlt || title}
            loading="lazy"
            className={projectCardImageVariants({})}
          />
          <div className={projectCardImageOverlayVariants({})} />
        </div>

        {/* Content */}
        <div className={projectCardContentVariants({})}>
          {/* Title */}
          <h3 className={projectCardTitleVariants({})}>
            {title}
          </h3>

          {/* Metadata */}
          {metadata && (
            <p className={projectCardMetadataVariants({})}>
              {metadata}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className={projectCardTagsContainerVariants({})}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={projectCardTagVariants({})}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </>
    );

    // Render as link if href provided
    if (href) {
      return (
        <a
          href={href}
          className={projectCardVariants({ interactive: true, className })}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {Content}
        </a>
      );
    }

    // Render as div with click handler
    return (
      <div
        className={projectCardVariants({ interactive: isInteractive, className })}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={isInteractive ? `View project: ${title}` : undefined}
        ref={ref}
        {...props}
      >
        {Content}
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
