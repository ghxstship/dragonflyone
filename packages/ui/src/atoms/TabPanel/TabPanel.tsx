"use client";

import React from "react";
import { tabPanelVariants } from "./TabPanel.variants.js";
import type { TabPanelProps } from "./TabPanel.types.js";

/**
 * TabPanel component - Bold Contemporary Pop Art Adventure
 * 
 * A panel component for tab content
 */
export function TabPanel({
  active,
  children,
  className,
}: TabPanelProps) {
  if (!active) return null;

  return (
    <div className={tabPanelVariants({ className })}>
      {children}
    </div>
  );
}
