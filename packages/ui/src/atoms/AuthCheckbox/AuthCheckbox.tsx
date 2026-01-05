"use client";

import React from "react";
import { Body } from "../../atoms/Typography/index.js";
import { authCheckboxVariants } from "./AuthCheckbox.variants.js";
import type { AuthCheckboxProps } from "./AuthCheckbox.types.js";

/**
 * AuthCheckbox component - Bold Contemporary Pop Art Adventure
 * 
 * A checkbox component specifically for authentication forms
 */
export function AuthCheckbox({
  checked,
  onChange,
  children,
  className,
}: AuthCheckboxProps) {
  return (
    <label className={authCheckboxVariants({ className })}>
      <div className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-1 w-4 h-4 text-[var(--color-primary-500)] border-2 border-[var(--color-border-default)] rounded-badge focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
        />
        <Body className="text-[var(--color-text-muted)] text-sm leading-relaxed">
          {children}
        </Body>
      </div>
    </label>
  );
}
