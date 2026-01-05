"use client";

import React from "react";
import clsx from "clsx";
import { halftonePatternVariants } from "./HalftonePattern.variants.js";
import type { 
  HalftonePatternProps, 
  HeroHalftoneProps, 
  GridPatternProps 
} from "./HalftonePattern.types.js";

const colorMap: Record<string, string> = {
  black: "var(--color-text-primary)",
  white: "var(--color-text-inverse)",
  grey: "var(--color-text-tertiary)",
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

/**
 * HalftonePattern component - Creates halftone patterns for backgrounds and overlays.
 * 
 * @example
 * ```tsx
 * <HalftonePattern
 *   pattern="dots"
 *   size={4}
 *   spacing={8}
 *   color="black"
 *   opacity={0.5}
 *   overlay
 * >
 *   <div>Content with halftone pattern</div>
 * </HalftonePattern>
 * ```
 */
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

  const patternStyle = {
    backgroundImage: `url("${encodedPattern}")`,
    backgroundRepeat: "repeat",
    backgroundColor,
    opacity,
  };

  if (overlay) {
    return (
      <div className={clsx(halftonePatternVariants({ overlay, className }))}>
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

/**
 * HeroHalftone component - Pre-configured halftone overlay for hero sections.
 * 
 * @example
 * ```tsx
 * <HeroHalftone variant="light">
 *   <h1>Hero Title</h1>
 *   <p>Hero description</p>
 * </HeroHalftone>
 * ```
 */
export function HeroHalftone({
  variant = "light",
  className = "",
  children,
}: HeroHalftoneProps) {
  return (
    <HalftonePattern
      pattern="dots"
      size={3}
      spacing={12}
      color={variant === "light" ? "var(--color-text-inverse)" : "var(--color-text-primary)"}
      opacity={variant === "light" ? 0.15 : 0.1}
      overlay
      className={className}
    >
      {children}
    </HalftonePattern>
  );
}

/**
 * GridPattern component - Pre-configured grid pattern for backgrounds.
 * 
 * @example
 * ```tsx
 * <GridPattern variant="subtle">
 *   <div>Content with grid pattern</div>
 * </GridPattern>
 * ```
 */
export function GridPattern({
  variant = "subtle",
  className = "",
  children,
}: GridPatternProps) {
  return (
    <HalftonePattern
      pattern="grid"
      size={variant === "bold" ? 2 : 1}
      spacing={variant === "bold" ? 24 : 48}
      color="var(--color-text-tertiary)"
      opacity={variant === "bold" ? 0.5 : 0.3}
      overlay
      className={className}
    >
      {children}
    </HalftonePattern>
  );
}

export default HalftonePattern;
