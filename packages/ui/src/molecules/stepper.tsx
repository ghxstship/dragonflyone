"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

const sizeStyles = {
  sm: {
    indicator: "24px",
    fontSize: fontSizes.monoXS,
    labelSize: fontSizes.monoSM,
    gap: "0.5rem",
    lineWidth: "2px",
  },
  md: {
    indicator: "32px",
    fontSize: fontSizes.monoSM,
    labelSize: fontSizes.monoMD,
    gap: "0.75rem",
    lineWidth: "2px",
  },
  lg: {
    indicator: "40px",
    fontSize: fontSizes.monoMD,
    labelSize: fontSizes.bodyMD,
    gap: "1rem",
    lineWidth: "3px",
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
  const styles = sizeStyles[size];
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
      className={className}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        alignItems: isHorizontal ? "flex-start" : "stretch",
        gap: styles.gap,
      }}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const clickable = isClickable(index);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            style={{
              display: "flex",
              flexDirection: isHorizontal ? "column" : "row",
              alignItems: isHorizontal ? "center" : "flex-start",
              flex: isHorizontal && !isLast ? 1 : "none",
              gap: styles.gap,
            }}
          >
            {/* Step indicator and connector */}
            <div
              style={{
                display: "flex",
                flexDirection: isHorizontal ? "row" : "column",
                alignItems: "center",
                flex: isHorizontal ? 1 : "none",
              }}
            >
              {/* Step indicator */}
              <button
                onClick={() => clickable && onStepClick?.(index)}
                disabled={!clickable}
                style={{
                  width: styles.indicator,
                  height: styles.indicator,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: typography.mono,
                  fontSize: styles.fontSize,
                  fontWeight: 400,
                  letterSpacing: letterSpacing.wide,
                  backgroundColor:
                    status === "completed"
                      ? colors.black
                      : status === "current"
                      ? colors.white
                      : colors.grey200,
                  color:
                    status === "completed"
                      ? colors.white
                      : status === "current"
                      ? colors.black
                      : colors.grey500,
                  border: `${borderWidths.medium} solid ${
                    status === "upcoming" ? colors.grey300 : colors.black
                  }`,
                  cursor: clickable ? "pointer" : "default",
                  transition: transitions.base,
                  flexShrink: 0,
                  padding: 0,
                }}
                aria-label={`Step ${index + 1}: ${step.label}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "completed" ? (
                  <span style={{ fontSize: "12px" }}>✓</span>
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: isHorizontal ? styles.lineWidth : "24px",
                    width: isHorizontal ? "auto" : styles.lineWidth,
                    minWidth: isHorizontal ? "24px" : "auto",
                    minHeight: isHorizontal ? "auto" : "24px",
                    backgroundColor:
                      status === "completed" || (status === "current" && completedSteps.includes(index))
                        ? colors.black
                        : colors.grey300,
                    margin: isHorizontal ? `0 ${styles.gap}` : `${styles.gap} 0`,
                    transition: transitions.base,
                  }}
                />
              )}
            </div>

            {/* Step label and description */}
            <div
              style={{
                textAlign: isHorizontal ? "center" : "left",
                flex: isHorizontal ? "none" : 1,
              }}
            >
              <div
                style={{
                  fontFamily: typography.mono,
                  fontSize: styles.labelSize,
                  color: status === "upcoming" ? colors.grey500 : colors.black,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                  fontWeight: status === "current" ? 700 : 400,
                }}
              >
                {step.label}
              </div>
              {step.description && (
                <div
                  style={{
                    fontFamily: typography.body,
                    fontSize: fontSizes.bodySM,
                    color: colors.grey600,
                    marginTop: "0.25rem",
                  }}
                >
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
