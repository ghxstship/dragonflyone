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
  sm: "text-mono-xs px-2 py-1",
  md: "text-mono-sm px-3 py-1.5",
  lg: "text-mono-md px-4 py-2",
};

const dotSizeClasses = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

export function UrgencyBadge({
  type,
  count,
  animated = true,
  size = "md",
  className = "",
}: UrgencyBadgeProps) {
  const config = urgencyConfig[type];
  const label = count !== undefined ? config.withCount(count) : config.label;
  const shouldPulse = animated && config.pulse;
  const showDot = type === "low-stock" || type === "selling-fast" || type === "last-chance";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-code font-normal tracking-widest uppercase transition-colors duration-base",
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        type === "new" && "border-2 border-black",
        shouldPulse && "animate-pulse",
        className
      )}
    >
      {showDot && (
        <span
          className={clsx(
            "bg-white rounded-full",
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
