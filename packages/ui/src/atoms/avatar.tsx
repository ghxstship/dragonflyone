"use client";

import React from "react";
import clsx from "clsx";

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials when no image */
  initials?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape variant */
  shape?: "circle" | "square";
  /** Show online status indicator */
  status?: "online" | "offline" | "away" | "busy";
  /** Border style */
  bordered?: boolean;
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const sizeClasses = {
  xs: { container: "w-avatar-xs h-avatar-xs", text: "text-mono-xxs", status: "w-spacing-1.5 h-spacing-1.5" },
  sm: { container: "w-avatar-sm h-avatar-sm", text: "text-mono-xs", status: "w-spacing-2 h-spacing-2" },
  md: { container: "w-avatar-md h-avatar-md", text: "text-mono-sm", status: "w-spacing-2.5 h-spacing-2.5" },
  lg: { container: "w-avatar-lg h-avatar-lg", text: "text-mono-md", status: "w-spacing-3 h-spacing-3" },
  xl: { container: "w-avatar-xl h-avatar-xl", text: "text-body-md", status: "w-spacing-4 h-spacing-4" },
};

const statusColorClasses = {
  online: "bg-success-500",
  offline: "bg-grey-500",
  away: "bg-warning-500",
  busy: "bg-error-500",
};

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  shape = "circle",
  status,
  bordered = false,
  inverted = false,
  className = "",
  onClick,
}: AvatarProps) {
  const config = sizeClasses[size];
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;
  const displayInitials = initials?.slice(0, 2).toUpperCase() || "?";

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center overflow-hidden flex-shrink-0",
        config.container,
        shape === "circle" ? "rounded-full" : "rounded-sm",
        showFallback && (inverted ? "bg-grey-200" : "bg-grey-800"),
        bordered && (inverted ? "border-2 border-white" : "border-2 border-black"),
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showFallback ? (
        <span
          className={clsx(
            "font-code font-weight-normal uppercase select-none",
            inverted ? "text-black" : "text-white",
            config.text
          )}
        >
          {displayInitials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover grayscale contrast-[1.1]"
        />
      )}

      {status && (
        <span
          className={clsx(
            "absolute rounded-full border-2",
            inverted ? "border-black" : "border-white",
            config.status,
            statusColorClasses[status],
            shape === "circle" ? "bottom-0 right-0" : "-bottom-0.5 -right-0.5"
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  /** Maximum avatars to show before +N indicator */
  max?: number;
  /** Size for all avatars */
  size?: AvatarProps["size"];
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Children (Avatar components) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

const groupOverlapClasses = {
  xs: "-ml-spacing-1.5",
  sm: "-ml-spacing-2",
  md: "-ml-spacing-2.5",
  lg: "-ml-spacing-3.5",
  xl: "-ml-spacing-5",
};

export function AvatarGroup({
  max = 4,
  size = "md",
  inverted = false,
  children,
  className = "",
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const config = sizeClasses[size];

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
                inverted,
              })
            : child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={clsx(
            "flex items-center justify-center rounded-full font-code",
            inverted ? "bg-grey-300 border-2 border-black text-black" : "bg-grey-700 border-2 border-white text-white",
            config.container,
            config.text,
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
