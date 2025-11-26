"use client";

import React from "react";
import clsx from "clsx";

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

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
  orientation?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

const sizeClasses = {
  sm: {
    indicator: "w-6 h-6 text-mono-xs",
    label: "text-mono-sm",
    gap: "gap-2",
    lineH: "h-0.5",
    lineW: "w-0.5",
  },
  md: {
    indicator: "w-8 h-8 text-mono-sm",
    label: "text-mono-md",
    gap: "gap-3",
    lineH: "h-0.5",
    lineW: "w-0.5",
  },
  lg: {
    indicator: "w-10 h-10 text-mono-md",
    label: "text-body-md",
    gap: "gap-4",
    lineH: "h-[3px]",
    lineW: "w-[3px]",
  },
};

export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  allowFutureSteps = false,
  orientation = "horizontal",
  size = "md",
  className = "",
}: StepperProps) {
  const config = sizeClasses[size];
  const isHorizontal = orientation === "horizontal";

  const getStepStatus = (index: number): "completed" | "current" | "upcoming" => {
    if (completedSteps.includes(index) || index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
  };

  const isClickable = (index: number): boolean => {
    if (!onStepClick) return false;
    const status = getStepStatus(index);
    if (status === "completed") return true;
    if (status === "current") return true;
    if (allowFutureSteps) return true;
    return false;
  };

  return (
    <div
      className={clsx(
        "flex",
        isHorizontal ? "flex-row items-start" : "flex-col",
        config.gap,
        className
      )}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const clickable = isClickable(index);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={clsx(
              "flex",
              isHorizontal ? "flex-col items-center" : "flex-row items-start",
              isHorizontal && !isLast && "flex-1",
              config.gap
            )}
          >
            {/* Step indicator and connector */}
            <div
              className={clsx(
                "flex items-center",
                isHorizontal ? "flex-row flex-1" : "flex-col"
              )}
            >
              {/* Step indicator */}
              <button
                onClick={() => clickable && onStepClick?.(index)}
                disabled={!clickable}
                className={clsx(
                  "rounded-full flex items-center justify-center font-code font-normal tracking-wide border-2 flex-shrink-0 p-0 transition-colors duration-base",
                  config.indicator,
                  status === "completed" && "bg-black text-white border-black",
                  status === "current" && "bg-white text-black border-black",
                  status === "upcoming" && "bg-grey-200 text-grey-500 border-grey-300",
                  clickable ? "cursor-pointer" : "cursor-default"
                )}
                aria-label={`Step ${index + 1}: ${step.label}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "completed" ? (
                  <span className="text-xs">✓</span>
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={clsx(
                    "flex-1 transition-colors duration-base",
                    isHorizontal ? clsx(config.lineH, "min-w-6 mx-2") : clsx(config.lineW, "min-h-6 my-2"),
                    status === "completed" || (status === "current" && completedSteps.includes(index))
                      ? "bg-black"
                      : "bg-grey-300"
                  )}
                />
              )}
            </div>

            {/* Step label and description */}
            <div
              className={clsx(
                isHorizontal ? "text-center" : "text-left flex-1"
              )}
            >
              <div
                className={clsx(
                  "font-code tracking-wide uppercase",
                  config.label,
                  status === "upcoming" ? "text-grey-500" : "text-black",
                  status === "current" && "font-bold"
                )}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="font-body text-body-sm text-grey-600 mt-1">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
