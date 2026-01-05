"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { workflowTimelineVariants } from "./WorkflowTimeline.variants.js";
import type { WorkflowTimelineProps } from "./WorkflowTimeline.types.js";
import { Stack, Grid } from "../../foundations/layout.js";
import { H3 } from "../../atoms/Typography/index.js";
import { Body } from "../../atoms/Typography/index.js";
import { Text } from "../../atoms/Text/index.js";
import { Badge } from "../../atoms/Badge/index.js";

/**
 * WorkflowTimeline - Displays a sequence of workflow stages
 * Used for tri-platform flows, development phases, etc.
 */
export const WorkflowTimeline = forwardRef<HTMLDivElement, WorkflowTimelineProps>(
  function WorkflowTimeline(
    {
      stages,
      variant = "vertical",
      cardVariant = "bordered",
      gap = 4,
      className,
      ...props
    },
    ref
  ) {
    const cardClasses = clsx(
      "flex flex-col gap-gap-sm p-spacing-4 md:flex-row md:items-start md:gap-gap-lg",
      workflowTimelineVariants({ variant, cardVariant })
    );

    return (
      <Grid ref={ref} gap={gap} className={className} {...props}>
        {stages.map((stage) => (
          <article key={stage.label} className={cardClasses}>
            <Text className="font-display text-h3-md text-text-disabled">{stage.label}</Text>
            <Stack gap={3} className="flex-1">
              <Stack>
                <H3 size="sm">{stage.title}</H3>
                <Body size="sm" className="mt-spacing-2 text-text-secondary">{stage.description}</Body>
              </Stack>
              {stage.tags && stage.tags.length > 0 && (
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="flex-wrap text-mono-xs uppercase tracking-kicker text-text-muted"
                >
                  {stage.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </Stack>
              )}
            </Stack>
          </article>
        ))}
      </Grid>
    );
  }
);

WorkflowTimeline.displayName = "WorkflowTimeline";
