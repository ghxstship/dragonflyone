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
  /** Custom className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const sizeClasses = {
  xs: { container: "w-6 h-6", text: "text-mono-xxs", status: "w-1.5 h-1.5" },
  sm: { container: "w-8 h-8", text: "text-mono-xs", status: "w-2 h-2" },
  md: { container: "w-10 h-10", text: "text-mono-sm", status: "w-2.5 h-2.5" },
  lg: { container: "w-14 h-14", text: "text-mono-md", status: "w-3 h-3" },
  xl: { container: "w-20 h-20", text: "text-body-md", status: "w-4 h-4" },
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
        showFallback && "bg-grey-800",
        bordered && "border-2 border-black",
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
            "font-code font-normal text-white uppercase select-none",
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
            "absolute rounded-full border-2 border-white",
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
  /** Children (Avatar components) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

const groupOverlapClasses = {
  xs: "-ml-1.5",
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3.5",
  xl: "-ml-5",
};

export function AvatarGroup({
  max = 4,
  size = "md",
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
              })
            : child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={clsx(
            "flex items-center justify-center rounded-full bg-grey-700 border-2 border-white font-code text-white",
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
