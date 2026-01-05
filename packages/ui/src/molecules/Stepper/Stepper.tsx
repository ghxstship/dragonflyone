"use client";

import React from "react";
import { Check } from "lucide-react";
import { 
  stepperVariants,
  stepperStepContainerVariants,
  stepperStepVariants,
  stepperIndicatorVariants,
  stepperContentVariants,
  stepperLabelVariants,
  stepperDescriptionVariants,
  stepperConnectorVariants 
} from "./Stepper.variants.js";
import type { 
  StepperProps,
  StepperOrientation,
  StepperSize 
} from "./Stepper.types.js";

/**
 * Stepper component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Stepper with steps and progress
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Stepper
 *   steps={steps}
 *   currentStep={1}
 *   completedSteps={[0]}
 *   orientation="horizontal"
 *   size="md"
 *   inverted={false}
 * />
 * ```
 */
export function Stepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  allowFutureSteps = false,
  orientation = "horizontal" as StepperOrientation,
  size = "md" as StepperSize,
  inverted = false,
  className,
}: StepperProps) {
  // Get step state
  const getStepState = (index: number): "active" | "completed" | "pending" | "disabled" => {
    if (completedSteps.includes(index)) return "completed";
    if (index === currentStep) return "active";
    if (index > currentStep && !allowFutureSteps) return "disabled";
    return "pending";
  };

  // Check if step is clickable
  const isStepClickable = (index: number) => {
    if (!onStepClick) return false;
    if (index === currentStep) return false;
    if (completedSteps.includes(index)) return true;
    if (allowFutureSteps) return true;
    return false;
  };

  // Handle step click
  const handleStepClick = (index: number) => {
    if (isStepClickable(index) && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className={stepperVariants({ orientation, inverted, className })}>
      {steps.map((step, index) => {
        const state = getStepState(index);
        const isClickable = isStepClickable(index);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className={stepperStepContainerVariants({ orientation, size, inverted })}>
            {/* Step */}
            <div className={stepperStepVariants({ orientation, size, inverted })}>
              {/* Indicator */}
              <button
                onClick={() => handleStepClick(index)}
                className={stepperIndicatorVariants({ 
                  size, 
                  state, 
                  clickable: isClickable, 
                  inverted 
                })}
                disabled={!isClickable}
                aria-current={state === "active" ? "step" : undefined}
              >
                {state === "completed" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step.icon || index + 1
                )}
              </button>

              {/* Content */}
              <div className={stepperContentVariants({ orientation, size, inverted })}>
                <div className={stepperLabelVariants({ size, state, inverted })}>
                  {step.label}
                </div>
                {step.description && (
                  <div className={stepperDescriptionVariants({ size, state, inverted })}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className={stepperConnectorVariants({ 
                orientation, 
                state: getStepState(index + 1), 
                inverted 
              })} />
            )}
          </div>
        );
      })}
    </div>
  );
}
