import type { ReactNode } from "react";

/**
 * Step interface
 */
export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Stepper orientation
 */
export type StepperOrientation = "horizontal" | "vertical";

/**
 * Stepper size
 */
export type StepperSize = "sm" | "md" | "lg";

/**
 * Stepper component props
 */
export interface StepperProps {
  /** Steps configuration */
  steps: Step[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Completed step indices */
  completedSteps?: number[];
  /** Step click handler */
  onStepClick?: (index: number) => void;
  /** Allow clicking on future steps */
  allowFutureSteps?: boolean;
  /** Orientation */
  orientation?: StepperOrientation;
  /** Size variant */
  size?: StepperSize;
  /** Theme inversion */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
