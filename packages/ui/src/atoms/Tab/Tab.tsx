"use client";

import React from "react";
import { tabVariants } from "./Tab.variants.js";
import type { TabProps } from "./Tab.types.js";

/**
 * Tab component - Bold Contemporary Pop Art Adventure
 * 
 * A simple tab component for navigation
 */
export function Tab({
  active,
  onClick,
  children,
  className,
}: TabProps) {
  return (
    <button
      onClick={onClick}
      className={tabVariants({ active, className })}
    >
      {children}
    </button>
  );
}
