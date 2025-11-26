"use client";

import React from "react";
import clsx from "clsx";

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

const sizeClasses = {
  sm: {
    price: "text-h5-md",
    original: "text-mono-sm",
    label: "text-mono-xs",
  },
  md: {
    price: "text-h4-md",
    original: "text-mono-md",
    label: "text-mono-sm",
  },
  lg: {
    price: "text-h3-md",
    original: "text-body-md",
    label: "text-mono-md",
  },
  xl: {
    price: "text-h2-md",
    original: "text-body-lg",
    label: "text-mono-md",
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
  const config = sizeClasses[size];
  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discountPercent;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {/* From label */}
      {showFrom && (
        <span
          className={clsx(
            "font-code tracking-widest uppercase",
            config.label,
            inverted ? "text-grey-400" : "text-grey-600"
          )}
        >
          FROM
        </span>
      )}

      {/* Price row */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Current price */}
        <span
          className={clsx(
            "font-heading tracking-tight",
            config.price,
            inverted ? "text-white" : "text-black"
          )}
        >
          {formatPrice(price, currency, currencySymbol)}
        </span>

        {/* Original price (strikethrough) */}
        {hasDiscount && (
          <span
            className={clsx(
              "font-code line-through tracking-wide",
              config.original,
              inverted ? "text-grey-400" : "text-grey-600"
            )}
          >
            {formatPrice(originalPrice, currency, currencySymbol)}
          </span>
        )}

        {/* Per unit */}
        {perUnit && (
          <span
            className={clsx(
              "font-code tracking-wide",
              config.label,
              inverted ? "text-grey-400" : "text-grey-600"
            )}
          >
            /{perUnit}
          </span>
        )}
      </div>

      {/* Discount badge */}
      {calculatedDiscount && calculatedDiscount > 0 && (
        <span
          className={clsx(
            "inline-flex self-start font-code tracking-widest px-1.5 py-0.5",
            config.label,
            inverted ? "text-black bg-white" : "text-white bg-black"
          )}
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
  const config = sizeClasses[size];

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
    <div className={clsx("flex items-baseline gap-1.5", className)}>
      <span
        className={clsx(
          "font-heading",
          config.price,
          inverted ? "text-white" : "text-black"
        )}
      >
        {formatPrice(minPrice, "USD", currencySymbol)}
      </span>
      <span
        className={clsx(
          "font-code",
          config.label,
          inverted ? "text-grey-400" : "text-grey-600"
        )}
      >
        –
      </span>
      <span
        className={clsx(
          "font-heading",
          config.price,
          inverted ? "text-white" : "text-black"
        )}
      >
        {formatPrice(maxPrice, "USD", currencySymbol)}
      </span>
    </div>
  );
}

export default PriceDisplay;
