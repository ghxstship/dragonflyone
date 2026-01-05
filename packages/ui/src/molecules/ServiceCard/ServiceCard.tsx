"use client";

import { forwardRef } from "react";
import { 
  serviceCardVariants,
  serviceCardIconContainerVariants,
  serviceCardIconVariants,
  serviceCardTitleVariants,
  serviceCardDescriptionVariants 
} from "./ServiceCard.variants.js";
import type { 
  ServiceCardProps,
  ServiceCardBackground 
} from "./ServiceCard.types.js";

/**
 * ServiceCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Service card with icon, title, and description
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ServiceCard
 *   icon={<Icon />}
 *   title="Web Development"
 *   description="Professional web development services"
 *   background="default"
 *   inverted={false}
 * />
 * ```
 */
export const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  function ServiceCard({
    icon,
    title,
    description,
    background = "default" as ServiceCardBackground,
    inverted = false,
    className,
    ...props
  }, ref) {
    return (
      <div
        ref={ref}
        className={serviceCardVariants({ background, inverted, className })}
        {...props}
      >
        {/* Icon */}
        <div className={serviceCardIconContainerVariants({ background, inverted })}>
          <div className={serviceCardIconVariants({ background, inverted })}>
            {icon}
          </div>
        </div>
        
        {/* Title */}
        <h3 className={serviceCardTitleVariants({ inverted })}>
          {title}
        </h3>
        
        {/* Description */}
        <p className={serviceCardDescriptionVariants({ inverted })}>
          {description}
        </p>
      </div>
    );
  }
);

ServiceCard.displayName = "ServiceCard";
