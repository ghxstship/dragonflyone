"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing } from "../tokens.js";

export interface PriceDisplayProps {
  /** Current price */
  price: number;
  /** Original price (for showing discount) */
  originalPrice?: number;
  /** Currency code */
  currency?: string;
  /** Currency symbol */
  currencySymbol?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show "From" prefix */
  showFrom?: boolean;
  /** Show per-unit text (e.g., "/month") */
  perUnit?: string;
  /** Discount percentage to display */
  discountPercent?: number;
  /** Inverted colors (white on black) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const sizeStyles = {
  sm: {
    price: fontSizes.h5MD,
    original: fontSizes.monoSM,
    label: fontSizes.monoXS,
  },
  md: {
    price: fontSizes.h4MD,
    original: fontSizes.monoMD,
    label: fontSizes.monoSM,
  },
  lg: {
    price: fontSizes.h3MD,
    original: fontSizes.bodyMD,
    label: fontSizes.monoMD,
  },
  xl: {
    price: fontSizes.h2MD,
    original: fontSizes.bodyLG,
    label: fontSizes.monoMD,
  },
};

export function formatPrice(
  amount: number,
  currency: string = "USD",
  symbol: string = "$"
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function PriceDisplay({
  price,
  originalPrice,
  currency = "USD",
  currencySymbol = "$",
  size = "md",
  showFrom = false,
  perUnit,
  discountPercent,
  inverted = false,
  className = "",
}: PriceDisplayProps) {
  const styles = sizeStyles[size];
  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discountPercent;

  const textColor = inverted ? colors.white : colors.black;
  const mutedColor = inverted ? colors.grey400 : colors.grey600;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      {/* From label */}
      {showFrom && (
        <span
          style={{
            fontFamily: typography.mono,
            fontSize: styles.label,
            color: mutedColor,
            letterSpacing: letterSpacing.widest,
            textTransform: "uppercase",
          }}
        >
          FROM
        </span>
      )}

      {/* Price row */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Current price */}
        <span
          style={{
            fontFamily: typography.heading,
            fontSize: styles.price,
            color: textColor,
            letterSpacing: letterSpacing.tight,
          }}
        >
          {formatPrice(price, currency, currencySymbol)}
        </span>

        {/* Original price (strikethrough) */}
        {hasDiscount && (
          <span
            style={{
              fontFamily: typography.mono,
              fontSize: styles.original,
              color: mutedColor,
              textDecoration: "line-through",
              letterSpacing: letterSpacing.wide,
            }}
          >
            {formatPrice(originalPrice, currency, currencySymbol)}
          </span>
        )}

        {/* Per unit */}
        {perUnit && (
          <span
            style={{
              fontFamily: typography.mono,
              fontSize: styles.label,
              color: mutedColor,
              letterSpacing: letterSpacing.wide,
            }}
          >
            /{perUnit}
          </span>
        )}
      </div>

      {/* Discount badge */}
      {calculatedDiscount && calculatedDiscount > 0 && (
        <span
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            fontFamily: typography.mono,
            fontSize: styles.label,
            color: inverted ? colors.black : colors.white,
            backgroundColor: inverted ? colors.white : colors.black,
            padding: "0.125rem 0.375rem",
            letterSpacing: letterSpacing.widest,
          }}
        >
          SAVE {calculatedDiscount}%
        </span>
      )}
    </div>
  );
}

export interface PriceRangeProps {
  /** Minimum price */
  minPrice: number;
  /** Maximum price */
  maxPrice: number;
  /** Currency symbol */
  currencySymbol?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Inverted colors */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

export function PriceRange({
  minPrice,
  maxPrice,
  currencySymbol = "$",
  size = "md",
  inverted = false,
  className = "",
}: PriceRangeProps) {
  const styles = sizeStyles[size];
  const textColor = inverted ? colors.white : colors.black;
  const mutedColor = inverted ? colors.grey400 : colors.grey600;

  if (minPrice === maxPrice) {
    return (
      <PriceDisplay
        price={minPrice}
        currencySymbol={currencySymbol}
        size={size}
        inverted={inverted}
        className={className}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "0.375rem",
      }}
    >
      <span
        style={{
          fontFamily: typography.heading,
          fontSize: styles.price,
          color: textColor,
        }}
      >
        {formatPrice(minPrice, "USD", currencySymbol)}
      </span>
      <span
        style={{
          fontFamily: typography.mono,
          fontSize: styles.label,
          color: mutedColor,
        }}
      >
        –
      </span>
      <span
        style={{
          fontFamily: typography.heading,
          fontSize: styles.price,
          color: textColor,
        }}
      >
        {formatPrice(maxPrice, "USD", currencySymbol)}
      </span>
    </div>
  );
}

export default PriceDisplay;
