import { forwardRef } from "react";
import { 
  contentCardVariants,
  contentCardKickerVariants,
  contentCardTitleVariants,
  contentCardDescriptionVariants,
  contentCardBulletsVariants,
  contentCardBulletItemVariants 
} from "./ContentCard.variants.js";
import type { ContentCardProps } from "./ContentCard.types.js";

/**
 * ContentCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Flexible content structure
 * - CVA-based variants for consistent theming
 * - Reusable card pattern for feature lists, roadmap items, etc.
 * 
 * @example
 * ```tsx
 * <ContentCard
 *   kicker="Feature"
 *   title="Advanced Analytics"
 *   description="Get insights into your data with powerful analytics tools."
 *   bullets={[
 *     "Real-time data processing",
 *     "Custom dashboards",
 *     "Export capabilities"
 *   ]}
 *   variant="bordered"
 *   padding="md"
 * />
 * ```
 */
export const ContentCard = forwardRef<HTMLElement, ContentCardProps>(
  function ContentCard({
    kicker,
    title,
    description,
    bullets,
    bulletPrefix = "•",
    variant = "bordered",
    padding = "md",
    footer,
    inverted = false,
    className,
    children,
    ...props
  }, ref) {
    return (
      <article
        ref={ref}
        className={contentCardVariants({ variant, padding, inverted, className })}
        {...props}
      >
        {/* Kicker */}
        {kicker && (
          <div className={contentCardKickerVariants({ inverted })}>
            {kicker}
          </div>
        )}

        {/* Title */}
        <h3 className={contentCardTitleVariants({ inverted })}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={contentCardDescriptionVariants({ inverted })}>
            {description}
          </p>
        )}

        {/* Bullets */}
        {bullets && bullets.length > 0 && (
          <ul className={contentCardBulletsVariants({ inverted })}>
            {bullets.map((bullet, index) => (
              <li 
                key={index}
                className={contentCardBulletItemVariants({ inverted })}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {bulletPrefix}
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Custom Content */}
        {children && (
          <div className="mb-4">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-auto pt-4 border-t border-border/20">
            {footer}
          </div>
        )}
      </article>
    );
  }
);

ContentCard.displayName = "ContentCard";
