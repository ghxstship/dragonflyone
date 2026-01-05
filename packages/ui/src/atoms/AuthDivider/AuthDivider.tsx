"use client";

import React from "react";
import { Body } from "../../atoms/Typography/index.js";
import { authDividerVariants } from "./AuthDivider.variants.js";
import type { AuthDividerProps } from "./AuthDivider.types.js";

/**
 * AuthDivider component - Bold Contemporary Pop Art Adventure
 * 
 * A divider component specifically for authentication forms
 */
export function AuthDivider({
  text,
  className,
}: AuthDividerProps) {
  return (
    <div className={authDividerVariants({ className })}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border-default)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--color-surface-primary)]">
            <Body className="text-[var(--color-text-muted)] font-mono">
              {text}
            </Body>
          </span>
        </div>
      </div>
    </div>
  );
}
