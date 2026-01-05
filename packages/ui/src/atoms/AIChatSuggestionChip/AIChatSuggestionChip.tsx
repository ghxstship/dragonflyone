"use client";

import React from "react";
import { aiChatSuggestionChipVariants } from "./AIChatSuggestionChip.variants.js";
import type { AIChatSuggestionChipProps } from "./AIChatSuggestionChip.types.js";

/**
 * AIChatSuggestionChip component - Bold Contemporary Pop Art Adventure
 * 
 * A suggestion chip for AI chat interactions
 */
export function AIChatSuggestionChip({
  children,
  onClick,
  disabled = false,
  className,
}: AIChatSuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={aiChatSuggestionChipVariants({ disabled, className })}
    >
      {children}
    </button>
  );
}
