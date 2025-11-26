import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Stack, Grid } from "../foundations/layout.js";
import { H3 } from "../atoms/typography.js";
import { Body } from "../atoms/typography.js";
import { Text } from "../atoms/text.js";
import { Badge } from "../atoms/badge.js";

export type WorkflowStage = {
  /** Stage number or label (e.g., "01", "Phase 1") */
  label: string;
  /** Stage title */
  title: string;
  /** Stage description */
  description: string;
  /** Tags/keywords for the stage */
  tags?: string[];
};

export type WorkflowTimelineProps = HTMLAttributes<HTMLDivElement> & {
  /** Array of workflow stages */
  stages: WorkflowStage[];
  /** Layout variant */
  variant?: "vertical" | "horizontal";
  /** Card variant */
  cardVariant?: "bordered" | "surface";
  /** Gap between items */
  gap?: number;
};

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
      "flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-6",
      cardVariant === "bordered" && "border border-ink-800",
      cardVariant === "surface" && "surface"
    );

    return (
      <Grid ref={ref} gap={gap} className={className} {...props}>
        {stages.map((stage) => (
          <article key={stage.label} className={cardClasses}>
            <Text className="font-display text-4xl text-ink-500">{stage.label}</Text>
            <Stack gap={3} className="flex-1">
              <Stack>
                <H3 className="text-2xl uppercase">{stage.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{stage.description}</Body>
              </Stack>
              {stage.tags && stage.tags.length > 0 && (
                <Stack
                  direction="horizontal"
                  gap={2}
                  className="flex-wrap text-xs uppercase tracking-[0.3em] text-ink-400"
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
