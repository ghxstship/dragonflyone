"use client";

import React from "react";
import clsx from "clsx";
import { Stack } from "../../foundations/layout.js";
import { H2, Body } from "../../atoms/Typography/index.js";
import { stateContentVariants } from "./StateContent.variants.js";
import type { StateContentProps } from "./StateContent.types.js";

/**
 * StateContent - Unified component for loading, error, empty, and other state displays
 *
 * Consolidates functionality from EmptyState, AIChatEmptyState, and state-specific displays
 * into a single, flexible component.
 *
 * @example
 * ```tsx
 * // Loading state
 * <StateContent
 *   icon={<Spinner size="lg" />}
 *   title="Loading"
 *   message="Loading dashboard..."
 * />
 *
 * // Empty state with actions
 * <StateContent
 *   icon={<SomeIcon />}
 *   title="No Data Found"
 *   message="Try adjusting your search criteria"
 *   action={<Button>Clear Filters</Button>}
 *   secondaryAction={<Button variant="outline">Create New</Button>}
 *   suggestions={<div>Try searching for different terms</div>}
 * />
 * ```
 */
export function StateContent({
  icon,
  title,
  message,
  action,
  secondaryAction,
  suggestions,
  className,
  
  ...props
}: StateContentProps) {
  return (
    <div className={clsx(stateContentVariants({ className }))} {...props}>
      <Stack gap={6} className="items-center text-center max-w-md">
        {icon}
        <Stack gap={2} className="items-center">
          <H2 className="text-[var(--color-text-primary)]">
            {title}
          </H2>
          <Body className="text-[var(--color-text-muted)]">
            {message}
          </Body>
        </Stack>

        {/* Actions */}
        {(action || secondaryAction) && (
          <Stack gap={3} className="items-center">
            {action}
            {secondaryAction}
          </Stack>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className="mt-4 text-left w-full max-w-sm">
            {suggestions}
          </div>
        )}
      </Stack>
    </div>
  );
}

export default StateContent;
