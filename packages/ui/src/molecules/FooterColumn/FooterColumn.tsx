"use client";

import React from "react";
import { footerColumnVariants } from "./FooterColumn.variants.js";
import type { FooterColumnProps } from "./FooterColumn.types.js";

/**
 * FooterColumn component - Bold Contemporary Pop Art Adventure
 * 
 * A column component for footer layouts
 */
export function FooterColumn({
  title,
  children,
  className,
}: FooterColumnProps) {
  return (
    <div className={footerColumnVariants({ className })}>
      {title && (
        <h3 className="font-heading text-lg font-bold text-text-primary mb-4">
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
