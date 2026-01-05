"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Container } from "../../foundations/layout.js";
import { Stack } from "../../foundations/layout.js";
import { Display, Body } from "../../atoms/Typography/index.js";
import { Button } from "../../atoms/Button/index.js";
import { Link } from "../../atoms/Link/index.js";
import { wizardPageVariants } from "./WizardPage.variants.js";
import type { WizardPageProps, WizardStep } from "./WizardPage.types.js";

/**
 * WizardPage component - Bold Contemporary Pop Art Adventure
 * 
 * A multi-step wizard interface with:
 * - Step navigation with progress indicator
 * - Form content for each step
 * - Back/Next navigation
 * - Completion state
 * - Responsive design
 */
export function WizardPage({
  title,
  subtitle,
  steps,
  currentStep = 0,
  onStepChange,
  onComplete,
  backHref,
  backLabel = "Back",
  completeLabel = "Complete",
  nextLabel = "Next",
  className,
}: WizardPageProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isCompleted = completedSteps.has(currentStep);

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onStepChange?.(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Can only navigate to completed steps or current step
    if (stepIndex <= currentStep) {
      onStepChange?.(stepIndex);
    }
  };

  return (
    <div className={wizardPageVariants({ className })}>
      {/* Header */}
      <header className="border-b-2 border-border bg-surface-elevated">
        <Container>
          <div className="flex items-center justify-between py-6">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              {backHref && (
                <Link
                  href={backHref}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-mono bg-surface-primary text-text-primary border-2 border-border rounded-badge hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {backLabel}
                </Link>
              )}
            </div>

            {/* Right: Progress */}
            <div className="flex items-center gap-2">
              <Body className="text-text-muted">
                Step {currentStep + 1} of {steps.length}
              </Body>
            </div>
          </div>
        </Container>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border bg-surface-primary">
        <Container>
          <div className="py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  {/* Step Circle */}
                  <button
                    onClick={() => handleStepClick(index)}
                    disabled={index > currentStep}
                    className={`
                      relative w-8 h-8 rounded-full border-2 flex items-center justify-center
                      transition-all duration-200
                      ${
                        index === currentStep
                          ? "border-primary bg-surface-primary shadow-primary"
                          : completedSteps.has(index)
                          ? "border-primary bg-primary text-white"
                          : index < currentStep
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface-primary text-text-muted cursor-not-allowed"
                      }
                    `}
                  >
                    {completedSteps.has(index) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </button>

                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-2 transition-colors duration-200
                        ${
                          index < currentStep
                            ? "bg-primary"
                            : "bg-border"
                        }
                      `}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Container>
          <Stack direction="vertical" gap={32} className="py-8">
            {/* Page Title */}
            <div className="text-center">
              <Display className="text-text-primary">{title}</Display>
              {subtitle && (
                <Body className="text-text-muted mt-2 max-w-2xl mx-auto">
                  {subtitle}
                </Body>
              )}
            </div>

            {/* Step Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">
                {currentStepData.title}
              </h2>
              {currentStepData.description && (
                <Body className="text-text-muted mt-2 max-w-xl mx-auto">
                  {currentStepData.description}
                </Body>
              )}
            </div>

            {/* Step Content */}
            <div className="mt-8">
              {currentStepData.content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {isLastStep ? completeLabel : nextLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Stack>
        </Container>
      </main>
    </div>
  );
}
