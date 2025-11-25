"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions } from "../tokens.js";

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
    bgColor: colors.grey900,
    textColor: colors.white,
    pulse: true,
  },
  "selling-fast": {
    label: "SELLING FAST",
    withCount: (count: number) => `${count} SOLD TODAY`,
    bgColor: colors.black,
    textColor: colors.white,
    pulse: true,
  },
  "last-chance": {
    label: "LAST CHANCE",
    withCount: () => "LAST CHANCE",
    bgColor: colors.black,
    textColor: colors.white,
    pulse: true,
  },
  "limited": {
    label: "LIMITED",
    withCount: (count: number) => `LIMITED TO ${count}`,
    bgColor: colors.grey800,
    textColor: colors.white,
    pulse: false,
  },
  "ending-soon": {
    label: "ENDING SOON",
    withCount: () => "ENDING SOON",
    bgColor: colors.black,
    textColor: colors.white,
    pulse: true,
  },
  "new": {
    label: "NEW",
    withCount: () => "NEW",
    bgColor: colors.white,
    textColor: colors.black,
    pulse: false,
  },
};

const sizeStyles = {
  sm: {
    fontSize: fontSizes.monoXS,
    padding: "0.25rem 0.5rem",
  },
  md: {
    fontSize: fontSizes.monoSM,
    padding: "0.375rem 0.75rem",
  },
  lg: {
    fontSize: fontSizes.monoMD,
    padding: "0.5rem 1rem",
  },
};

export function UrgencyBadge({
  type,
  count,
  animated = true,
  size = "md",
  className = "",
}: UrgencyBadgeProps) {
  const config = urgencyConfig[type];
  const styles = sizeStyles[size];
  const label = count !== undefined ? config.withCount(count) : config.label;
  const shouldPulse = animated && config.pulse;

  return (
    <>
      {shouldPulse && (
        <style>
          {`
            @keyframes urgency-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}
        </style>
      )}
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontFamily: typography.mono,
          fontSize: styles.fontSize,
          fontWeight: 400,
          letterSpacing: letterSpacing.widest,
          textTransform: "uppercase",
          backgroundColor: config.bgColor,
          color: config.textColor,
          padding: styles.padding,
          border: type === "new" ? `2px solid ${colors.black}` : "none",
          animation: shouldPulse ? "urgency-pulse 2s ease-in-out infinite" : "none",
          transition: transitions.base,
        }}
      >
        {(type === "low-stock" || type === "selling-fast" || type === "last-chance") && (
          <span
            style={{
              width: size === "sm" ? "6px" : size === "lg" ? "10px" : "8px",
              height: size === "sm" ? "6px" : size === "lg" ? "10px" : "8px",
              backgroundColor: colors.white,
              borderRadius: "50%",
              animation: shouldPulse ? "urgency-pulse 1s ease-in-out infinite" : "none",
            }}
          />
        )}
        {label}
      </span>
    </>
  );
}

export default UrgencyBadge;
