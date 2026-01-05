import type { HTMLAttributes } from "react";

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
