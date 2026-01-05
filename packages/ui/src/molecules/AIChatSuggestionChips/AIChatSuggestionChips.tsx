"use client";

import React from "react";
import { Stack } from "../../foundations/layout.js";
import { aiChatSuggestionChipsVariants } from "./AIChatSuggestionChips.variants.js";
import type { AIChatSuggestionChipsProps } from "./AIChatSuggestionChips.types.js";
import { AIChatSuggestionChip } from "../../atoms/AIChatSuggestionChip/index.js";

/**
 * AIChatSuggestionChips component - Bold Contemporary Pop Art Adventure
 * 
 * A container for AI chat suggestion chips
 */
export function AIChatSuggestionChips({
  suggestions,
  onSuggestionClick,
  className,
}: AIChatSuggestionChipsProps) {
  return (
    <div className={aiChatSuggestionChipsVariants({ className })}>
      <Stack direction="horizontal" gap={2}>
        {suggestions.map((suggestion: string, index: number) => (
          <AIChatSuggestionChip
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </AIChatSuggestionChip>
        ))}
      </Stack>
    </div>
  );
}
