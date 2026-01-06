"use client";

import React from "react";
import clsx from "clsx";
import { skipLinkVariants } from "./SkipLink.variants.js";
import type { SkipLinkProps } from "./SkipLink.types.js";

/**
 * SkipLink - Accessibility skip link for screen readers and keyboard navigation
 *
 * @example
 * ```tsx
 * <SkipLink href="#main-content" label="Skip to main content" />
 * ```
 */
export function SkipLink({
  href,
  label,
  className,
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={clsx(skipLinkVariants({ className }))}
      {...props}
    >
      {label}
    </a>
  );
}

export default SkipLink;
