"use client";

import React from "react";
import clsx from "clsx";

export interface UrgencyBadgeProps {
  /** Type of urgency indicator */
  type: "low-stock" | "selling-fast" | "last-chance" | "limited" | "ending-soon" | "new";
  /** Custom count (e.g., "Only 5 left") */
  count?: number;
  /** Animate the badge */
  animated?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const urgencyConfig = {
  "low-stock": {
    label: "LOW STOCK",
    withCount: (count: number) => `ONLY ${count} LEFT`,
    bgClass: "bg-grey-900",
    textClass: "text-white",
    pulse: true,
  },
  "selling-fast": {
    label: "SELLING FAST",
    withCount: (count: number) => `${count} SOLD TODAY`,
    bgClass: "bg-black",
    textClass: "text-white",
    pulse: true,
  },
  "last-chance": {
    label: "LAST CHANCE",
    withCount: () => "LAST CHANCE",
    bgClass: "bg-black",
    textClass: "text-white",
    pulse: true,
  },
  "limited": {
    label: "LIMITED",
    withCount: (count: number) => `LIMITED TO ${count}`,
    bgClass: "bg-grey-800",
    textClass: "text-white",
    pulse: false,
  },
  "ending-soon": {
    label: "ENDING SOON",
    withCount: () => "ENDING SOON",
    bgClass: "bg-black",
    textClass: "text-white",
    pulse: true,
  },
  "new": {
    label: "NEW",
    withCount: () => "NEW",
    bgClass: "bg-white",
    textClass: "text-black",
    pulse: false,
  },
};

const sizeClasses = {
  sm: "text-mono-xs px-spacing-2 py-spacing-1",
  md: "text-mono-sm px-spacing-3 py-spacing-1",
  lg: "text-mono-md px-spacing-4 py-spacing-2",
};

const dotSizeClasses = {
  sm: "w-spacing-1 h-spacing-1",
  md: "w-spacing-2 h-spacing-2",
  lg: "w-spacing-2 h-spacing-2",
};

export function UrgencyBadge({
  type,
  count,
  animated = true,
  size = "md",
  inverted = false,
  className = "",
}: UrgencyBadgeProps) {
  const config = urgencyConfig[type];
  const label = count !== undefined ? config.withCount(count) : config.label;
  const shouldPulse = animated && config.pulse;
  const showDot = type === "low-stock" || type === "selling-fast" || type === "last-chance";

  // Inverted theme adjustments for "new" badge
  const bgClass = inverted && type === "new" ? "bg-black" : config.bgClass;
  const textClass = inverted && type === "new" ? "text-white" : config.textClass;
  const borderClass = type === "new" ? (inverted ? "border-2 border-white" : "border-2 border-black") : "";
  const dotClass = inverted ? "bg-black" : "bg-white";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-gap-xs font-code font-weight-normal tracking-widest uppercase transition-colors duration-base",
        bgClass,
        textClass,
        sizeClasses[size],
        borderClass,
        shouldPulse && "animate-pulse",
        className
      )}
    >
      {showDot && (
        <span
          className={clsx(
            "rounded-full",
            dotClass,
            dotSizeClasses[size],
            shouldPulse && "animate-pulse"
          )}
        />
      )}
      {label}
    </span>
  );
}

export default UrgencyBadge;
