"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { priceDisplayVariants, priceRangeVariants } from "./PriceDisplay.variants.js";
import type { PriceDisplayProps, PriceRangeProps } from "./PriceDisplay.types.js";

export function formatPrice(
  amount: number,
  _currency: string = "USD",
  symbol: string = "$"
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export const PriceDisplay = forwardRef<HTMLDivElement, PriceDisplayProps>(
  function PriceDisplay(
    {
      price,
      originalPrice,
      currency = "USD",
      currencySymbol = "$",
      size = "md",
      showFrom = false,
      perUnit,
      discountPercent,
      inverted = false,
      className,
      ...restProps
    },
    ref
  ) {
    const variantClasses = priceDisplayVariants({ size, inverted });
    const hasDiscount = originalPrice && originalPrice > price;
    const calculatedDiscount = hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : discountPercent;

    // Size-specific classes
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

    const config = sizeClasses[size];
    const invertedClasses = inverted ? "text-text-primary" : "text-text-primary";

    return (
      <div
        ref={ref}
        className={clsx(variantClasses, className)}
        {...restProps}
      >
        {/* From label */}
        {showFrom && (
          <span
            className={clsx(
              "font-code tracking-widest uppercase",
              config.label,
              inverted ? "text-text-muted" : "text-text-muted"
            )}
          >
            FROM
          </span>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-gap-xs flex-wrap">
          {/* Current price */}
          <span
            className={clsx(
              "font-heading tracking-tight",
              config.price,
              invertedClasses
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
                inverted ? "text-text-muted" : "text-text-muted"
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
                inverted ? "text-text-muted" : "text-text-muted"
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
              "inline-flex self-start font-code tracking-widest px-spacing-1 py-spacing-0.5",
              config.label,
              inverted ? "text-text-primary bg-surface-primary" : "text-text-primary bg-surface-inverse"
            )}
          >
            SAVE {calculatedDiscount}%
          </span>
        )}
      </div>
    );
  }
);

export const PriceRange = forwardRef<HTMLDivElement, PriceRangeProps>(
  function PriceRange(
    {
      minPrice,
      maxPrice,
      currencySymbol = "$",
      size = "md",
      inverted = false,
      className,
      ...restProps
    },
    ref
  ) {
    const variantClasses = priceRangeVariants({ size, inverted });

    // Size-specific classes
    const sizeClasses = {
      sm: {
        price: "text-h5-md",
        label: "text-mono-xs",
      },
      md: {
        price: "text-h4-md",
        label: "text-mono-sm",
      },
      lg: {
        price: "text-h3-md",
        label: "text-mono-md",
      },
    };

    const config = sizeClasses[size];
    const invertedClasses = inverted ? "text-text-primary" : "text-text-primary";

    if (minPrice === maxPrice) {
      return (
        <PriceDisplay
          ref={ref}
          price={minPrice}
          currencySymbol={currencySymbol}
          size={size}
          inverted={inverted}
          className={className}
          {...restProps}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(variantClasses, className)}
        {...restProps}
      >
        <span
          className={clsx(
            "font-heading",
            config.price,
            invertedClasses
          )}
        >
          {formatPrice(minPrice, "USD", currencySymbol)}
        </span>
        <span
          className={clsx(
            "font-code",
            config.label,
            inverted ? "text-text-muted" : "text-text-muted"
          )}
        >
          –
        </span>
        <span
          className={clsx(
            "font-heading",
            config.price,
            invertedClasses
          )}
        >
          {formatPrice(maxPrice, "USD", currencySymbol)}
        </span>
      </div>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";
PriceRange.displayName = "PriceRange";
