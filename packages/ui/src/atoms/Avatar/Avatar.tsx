"use client";

import React from "react";
import clsx from "clsx";
import { avatarVariants, avatarStatusVariants } from "./Avatar.variants.js";
import type { AvatarProps, AvatarGroupProps } from "./Avatar.types.js";

/**
 * Avatar component
 * 
 * A styled avatar that uses design tokens via CSS custom properties
 * for consistent styling across themes and whitelabel configurations.
 * 
 * @example
 * ```tsx
 * <Avatar
 *   src="/avatar.jpg"
 *   alt="John Doe"
 *   initials="JD"
 *   size="lg"
 *   status="online"
 *   bordered
 * />
 * ```
 */
export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  shape = "circle",
  status,
  bordered = false,
  className,
  onClick,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showFallback = !src || imageError;
  const displayInitials = initials?.slice(0, 2).toUpperCase() || "?";

  return (
    <div
      className={avatarVariants({
        size,
        shape,
        bordered,
        interactive: !!onClick,
        className,
      })}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showFallback ? (
        <span
          className={clsx(
            "font-code font-bold uppercase select-none",
            "text-[var(--color-text-primary)]",
            size === "xs" && "text-[8px] sm:text-[var(--font-size-label-xxs)]",
            size === "sm" && "text-[9px] sm:text-[var(--font-size-label-xs)]",
            size === "md" && "text-[10px] sm:text-[var(--font-size-label-sm)]",
            size === "lg" && "text-xs sm:text-[var(--font-size-label-md)]",
            size === "xl" && "text-sm sm:text-[var(--font-size-body-md)]",
          )}
        >
          {displayInitials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover grayscale contrast-[1.1]"
          style={{ 
            imageRendering: 'auto',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        />
      )}

      {status && (
        <span
          className={avatarStatusVariants({
            status,
            size,
            shape,
          })}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

/**
 * AvatarGroup component
 * 
 * A container for multiple avatars with overlap and overflow handling.
 * 
 * @example
 * ```tsx
 * <AvatarGroup max={3} size="md">
 *   <Avatar src="/user1.jpg" initials="AB" />
 *   <Avatar src="/user2.jpg" initials="CD" />
 *   <Avatar src="/user3.jpg" initials="EF" />
 *   <Avatar src="/user4.jpg" initials="GH" />
 * </AvatarGroup>
 * ```
 */
export function AvatarGroup({
  max = 4,
  size = "md",
  children,
  className,
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  // Overlap classes for different sizes
  const groupOverlapClasses = {
    xs: "-ml-[var(--spacing-1)]",
    sm: "-ml-[var(--spacing-2)]",
    md: "-ml-[var(--spacing-2)]",
    lg: "-ml-[var(--spacing-3)]",
    xl: "-ml-[var(--spacing-4)]",
  };

  return (
    <div className={clsx("flex items-center", className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={clsx(
            "relative",
            index > 0 && groupOverlapClasses[size]
          )}
          style={{ zIndex: visibleChildren.length - index }}
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                size,
                bordered: true,
              })
            : child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={clsx(
            "flex items-center justify-center rounded-[var(--radius-circle)] font-code",
            "bg-[var(--color-surface-elevated)] border-2 border-[var(--color-border-default)]",
            "text-[var(--color-text-primary)]",
            size === "xs" && "w-6 h-6 sm:w-[var(--size-avatar-xs)] sm:h-[var(--size-avatar-xs)]",
            size === "sm" && "w-7 h-7 sm:w-[var(--size-avatar-sm)] sm:h-[var(--size-avatar-sm)]",
            size === "md" && "w-8 h-8 sm:w-[var(--size-avatar-md)] sm:h-[var(--size-avatar-md)]",
            size === "lg" && "w-10 h-10 sm:w-[var(--size-avatar-lg)] sm:h-[var(--size-avatar-lg)]",
            size === "xl" && "w-12 h-12 sm:w-[var(--size-avatar-xl)] sm:h-[var(--size-avatar-xl)]",
            size === "xs" && "text-[8px] sm:text-[var(--font-size-label-xxs)]",
            size === "sm" && "text-[9px] sm:text-[var(--font-size-label-xs)]",
            size === "md" && "text-[10px] sm:text-[var(--font-size-label-sm)]",
            size === "lg" && "text-xs sm:text-[var(--font-size-label-md)]",
            size === "xl" && "text-sm sm:text-[var(--font-size-body-md)]",
            groupOverlapClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default Avatar;
