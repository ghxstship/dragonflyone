"use client";

import React from "react";
import clsx from "clsx";

export interface HalftonePatternProps {
  /** Pattern type */
  pattern?: "dots" | "lines" | "grid" | "diagonal";
  /** Dot/line size in pixels */
  size?: number;
  /** Spacing between elements */
  spacing?: number;
  /** Pattern color - use 'black' or 'white' for token colors */
  color?: "black" | "white" | "grey" | string;
  /** Background color */
  backgroundColor?: string;
  /** Opacity of the pattern (0-1) */
  opacity?: number;
  /** Whether to use as overlay (absolute positioned) */
  overlay?: boolean;
  /** Custom className */
  className?: string;
  /** Children to render on top */
  children?: React.ReactNode;
}

const colorMap: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  grey: "#737373",
};

function getColorValue(color: string): string {
  return colorMap[color] || color;
}

function generateDotPattern(size: number, spacing: number, color: string): string {
  const totalSize = size + spacing;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">
      <circle cx="${totalSize / 2}" cy="${totalSize / 2}" r="${size / 2}" fill="${color}"/>
    </svg>
  `;
}

function generateLinePattern(size: number, spacing: number, color: string): string {
  const totalSize = size + spacing;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">
      <line x1="0" y1="${totalSize / 2}" x2="${totalSize}" y2="${totalSize / 2}" stroke="${color}" stroke-width="${size}"/>
    </svg>
  `;
}

function generateGridPattern(size: number, spacing: number, color: string): string {
  const totalSize = size + spacing;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">
      <line x1="0" y1="${totalSize / 2}" x2="${totalSize}" y2="${totalSize / 2}" stroke="${color}" stroke-width="${size / 2}"/>
      <line x1="${totalSize / 2}" y1="0" x2="${totalSize / 2}" y2="${totalSize}" stroke="${color}" stroke-width="${size / 2}"/>
    </svg>
  `;
}

function generateDiagonalPattern(size: number, spacing: number, color: string): string {
  const totalSize = (size + spacing) * 2;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">
      <line x1="0" y1="0" x2="${totalSize}" y2="${totalSize}" stroke="${color}" stroke-width="${size}"/>
      <line x1="${totalSize}" y1="0" x2="0" y2="${totalSize}" stroke="${color}" stroke-width="${size}"/>
    </svg>
  `;
}

export function HalftonePattern({
  pattern = "dots",
  size = 4,
  spacing = 8,
  color = "black",
  backgroundColor = "transparent",
  opacity = 0.5,
  overlay = false,
  className = "",
  children,
}: HalftonePatternProps) {
  const patternGenerators = {
    dots: generateDotPattern,
    lines: generateLinePattern,
    grid: generateGridPattern,
    diagonal: generateDiagonalPattern,
  };

  const colorValue = getColorValue(color);
  const svgPattern = patternGenerators[pattern](size, spacing, colorValue);
  const encodedPattern = `data:image/svg+xml,${encodeURIComponent(svgPattern)}`;

  const patternStyle: React.CSSProperties = {
    backgroundImage: `url("${encodedPattern}")`,
    backgroundRepeat: "repeat",
    backgroundColor,
    opacity,
  };

  if (overlay) {
    return (
      <div className={clsx("relative", className)}>
        {children}
        <div
          className="absolute inset-0 pointer-events-none"
          style={patternStyle}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className={clsx("w-full h-full", className)}
      style={patternStyle}
    >
      {children}
    </div>
  );
}

/** Pre-configured halftone overlay for hero sections */
export function HeroHalftone({
  variant = "light",
  className = "",
  children,
}: {
  variant?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <HalftonePattern
      pattern="dots"
      size={3}
      spacing={12}
      color={variant === "light" ? "white" : "black"}
      opacity={variant === "light" ? 0.15 : 0.1}
      overlay
      className={className}
    >
      {children}
    </HalftonePattern>
  );
}

/** Pre-configured grid pattern for backgrounds */
export function GridPattern({
  variant = "subtle",
  className = "",
  children,
}: {
  variant?: "subtle" | "bold";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <HalftonePattern
      pattern="grid"
      size={variant === "bold" ? 2 : 1}
      spacing={variant === "bold" ? 24 : 48}
      color="grey"
      opacity={variant === "bold" ? 0.5 : 0.3}
      overlay
      className={className}
    >
      {children}
    </HalftonePattern>
  );
}

export default HalftonePattern;
