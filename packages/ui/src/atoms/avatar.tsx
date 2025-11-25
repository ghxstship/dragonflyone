"use client";

import React from "react";
import { colors, typography, fontSizes, borderWidths } from "../tokens.js";

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

const sizeMap = {
  xs: { size: "1.5rem", fontSize: fontSizes.monoXXS, statusSize: "0.375rem" },
  sm: { size: "2rem", fontSize: fontSizes.monoXS, statusSize: "0.5rem" },
  md: { size: "2.5rem", fontSize: fontSizes.monoSM, statusSize: "0.625rem" },
  lg: { size: "3.5rem", fontSize: fontSizes.monoMD, statusSize: "0.75rem" },
  xl: { size: "5rem", fontSize: fontSizes.bodyMD, statusSize: "1rem" },
};

const statusColors = {
  online: "#22C55E",
  offline: colors.grey500,
  away: "#F59E0B",
  busy: "#EF4444",
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
  const sizeStyles = sizeMap[size];
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;
  const displayInitials = initials?.slice(0, 2).toUpperCase() || "?";

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: sizeStyles.size,
    height: sizeStyles.size,
    borderRadius: shape === "circle" ? "50%" : "4px",
    backgroundColor: showFallback ? colors.grey800 : "transparent",
    border: bordered ? `${borderWidths.medium} solid ${colors.black}` : "none",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
    flexShrink: 0,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showFallback ? (
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: sizeStyles.fontSize,
            fontWeight: 400,
            color: colors.white,
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          {displayInitials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(100%) contrast(1.1)",
          }}
        />
      )}

      {status && (
        <span
          style={{
            position: "absolute",
            bottom: shape === "circle" ? "0" : "-2px",
            right: shape === "circle" ? "0" : "-2px",
            width: sizeStyles.statusSize,
            height: sizeStyles.statusSize,
            backgroundColor: statusColors[status],
            borderRadius: "50%",
            border: `2px solid ${colors.white}`,
          }}
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

export function AvatarGroup({
  max = 4,
  size = "md",
  children,
  className = "",
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const sizeStyles = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? `-${parseInt(sizeStyles.size) * 0.25}rem` : 0,
            position: "relative",
            zIndex: visibleChildren.length - index,
          }}
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
          style={{
            marginLeft: `-${parseInt(sizeStyles.size) * 0.25}rem`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: sizeStyles.size,
            height: sizeStyles.size,
            borderRadius: "50%",
            backgroundColor: colors.grey700,
            border: `${borderWidths.medium} solid ${colors.white}`,
            fontFamily: typography.mono,
            fontSize: sizeStyles.fontSize,
            color: colors.white,
            zIndex: 0,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default Avatar;
