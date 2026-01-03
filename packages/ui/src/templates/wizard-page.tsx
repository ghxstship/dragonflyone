"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Container, Stack } from "../foundations/layout.js";
import { PageHeader as EnterprisePageHeader } from "../organisms/page-header.js";
import { MainContent } from "./content-layout.js";
import { Card } from "../molecules/card.js";
import { Button } from "../atoms/button.js";
import { Body } from "../atoms/typography.js";
import { Spinner } from "../atoms/spinner.js";
import { EmptyState } from "../molecules/empty-state.js";
import { Stepper, type Step } from "../molecules/stepper.js";

// =============================================================================
// TYPES
// =============================================================================

export interface WizardStep extends Step {
  /** Step content renderer */
  content: ReactNode;
  /** Optional validation function - return true if step is valid */
  isValid?: boolean;
}

// BreadcrumbItem imported from canonical types
import type { BreadcrumbItem } from "../types/breadcrumb.js";
export type { BreadcrumbItem } from "../types/breadcrumb.js";

export interface WizardBanner {
  /** Banner icon */
  icon?: ReactNode;
  /** Banner title */
  title: string;
  /** Banner description */
  description?: string;
  /** Banner action */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface WizardPageProps {
  /** Page title */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Wizard steps configuration */
  steps: WizardStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Step change handler */
  onStepChange: (step: number) => void;
  /** Final submit handler */
  onSubmit: () => void | Promise<void>;
  /** Submit button label */
  submitLabel?: string;
  /** Is form submitting */
  isSubmitting?: boolean;
  /** Allow clicking on completed steps to go back */
  allowStepNavigation?: boolean;
  /** Allow clicking on future steps */
  allowFutureSteps?: boolean;
  /** Optional banner above stepper (e.g., AI Blueprint option) */
  banner?: WizardBanner;
  /** Additional actions in header */
  headerActions?: ReactNode;
  /** Show favorite toggle */
  showFavorite?: boolean;
  /** Show settings button */
  showSettings?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Access denied state */
  accessDenied?: {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
  /** Loading state */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Stepper orientation */
  stepperOrientation?: "horizontal" | "vertical";
  /** Stepper size */
  stepperSize?: "sm" | "md" | "lg";
  /** Back button label */
  backLabel?: string;
  /** Next button label */
  nextLabel?: string;
  /** Cancel handler (optional - shows cancel button if provided) */
  onCancel?: () => void;
  /** Cancel button label */
  cancelLabel?: string;
}

/**
 * WizardPage template - Bold Contemporary Pop Art Adventure
 * 
 * Standardized template for multi-step wizard flows.
 * 
 * Features:
 * - EnterprisePageHeader with breadcrumbs
 * - Stepper component for step navigation
 * - Step content rendering
 * - Back/Next/Submit navigation
 * - Optional banner (e.g., AI Blueprint option)
 * - Loading and access denied states
 * - Dark-first design
 * 
 * Use cases:
 * - Production creation wizard
 * - Vendor onboarding
 * - User signup flows
 * - Survey completion
 * - Multi-step forms
 * 
 * @example
 * ```tsx
 * const steps: WizardStep[] = [
 *   { id: 'basics', label: 'Basic Info', content: <BasicInfoForm /> },
 *   { id: 'details', label: 'Details', content: <DetailsForm /> },
 *   { id: 'review', label: 'Review', content: <ReviewStep /> },
 * ];
 * 
 * <WizardPage
 *   title="Create New Production"
 *   subtitle="Set up a new production from scratch"
 *   steps={steps}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 * />
 * ```
 */
export const WizardPage = forwardRef<HTMLDivElement, WizardPageProps>(
  function WizardPage(
    {
      title,
      subtitle,
      breadcrumbs,
      steps,
      currentStep,
      onStepChange,
      onSubmit,
      submitLabel = "Complete",
      isSubmitting = false,
      allowStepNavigation = true,
      allowFutureSteps = false,
      banner,
      headerActions,
      showFavorite = false,
      showSettings = false,
      inverted = true,
      className,
      accessDenied,
      isLoading = false,
      loadingText = "Loading...",
      stepperOrientation = "horizontal",
      stepperSize = "md",
      backLabel = "Back",
      nextLabel = "Next",
      onCancel,
      cancelLabel = "Cancel",
    },
    ref
  ) {
    const bgClass = inverted ? "bg-surface-inverse" : "bg-surface-primary";
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const currentStepData = steps[currentStep];
    const canProceed = currentStepData?.isValid !== false;

    const handleNext = () => {
      if (!isLastStep && canProceed) {
        onStepChange(currentStep + 1);
      }
    };

    const handleBack = () => {
      if (!isFirstStep) {
        onStepChange(currentStep - 1);
      }
    };

    const handleStepClick = (index: number) => {
      if (allowStepNavigation) {
        onStepChange(index);
      }
    };

    // Loading state
    if (isLoading) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title={title}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <Stack gap={6} className="items-center justify-center py-16">
                <Spinner size="lg" />
                <Body className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                  {loadingText}
                </Body>
              </Stack>
            </Container>
          </MainContent>
        </div>
      );
    }

    // Access denied state
    if (accessDenied) {
      return (
        <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
          <EnterprisePageHeader
            title="Access Denied"
            subtitle=""
            inverted={inverted}
          />
          <MainContent padding="lg" inverted={inverted}>
            <Container>
              <EmptyState
                title={accessDenied.title}
                description={accessDenied.description}
                action={accessDenied.action}
                inverted={inverted}
              />
            </Container>
          </MainContent>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
        <EnterprisePageHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          showFavorite={showFavorite}
          showSettings={showSettings}
          rightContent={headerActions}
          inverted={inverted}
        />
        <MainContent padding="lg" inverted={inverted}>
          <Container className="max-w-4xl">
            <Stack gap={8}>
              {/* Optional Banner */}
              {banner && (
                <Card
                  inverted={inverted}
                  className={clsx(
                    "border-2",
                    inverted ? "border-primary" : "border-primary"
                  )}
                >
                  <Stack
                    direction="horizontal"
                    className="items-center justify-between p-4"
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      {banner.icon && (
                        <div className="text-primary">{banner.icon}</div>
                      )}
                      <Stack gap={1}>
                        <Body
                          className={clsx(
                            "font-semibold",
                            inverted ? "text-on-dark-primary" : "text-on-light-primary"
                          )}
                        >
                          {banner.title}
                        </Body>
                        {banner.description && (
                          <Body
                            size="sm"
                            className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}
                          >
                            {banner.description}
                          </Body>
                        )}
                      </Stack>
                    </Stack>
                    {banner.action && (
                      <Button
                        variant="outline"
                        inverted={inverted}
                        onClick={banner.action.onClick}
                      >
                        {banner.action.label}
                      </Button>
                    )}
                  </Stack>
                </Card>
              )}

              {/* Stepper */}
              <Stepper
                steps={steps.map((s) => ({
                  id: s.id,
                  label: s.label,
                  description: s.description,
                  icon: s.icon,
                }))}
                currentStep={currentStep}
                onStepClick={allowStepNavigation ? handleStepClick : undefined}
                allowFutureSteps={allowFutureSteps}
                orientation={stepperOrientation}
                size={stepperSize}
              />

              {/* Step Content */}
              <Card inverted={inverted} className="p-6">
                {currentStepData?.content}
              </Card>

              {/* Navigation */}
              <Stack direction="horizontal" className="justify-between">
                <Stack direction="horizontal" gap={2}>
                  {onCancel && isFirstStep && (
                    <Button
                      variant="ghost"
                      inverted={inverted}
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      inverted={inverted}
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {backLabel}
                    </Button>
                  )}
                </Stack>

                {isLastStep ? (
                  <Button
                    variant="solid"
                    onClick={onSubmit}
                    disabled={isSubmitting || !canProceed}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {submitLabel}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="solid"
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    {nextLabel}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </Stack>
            </Stack>
          </Container>
        </MainContent>
      </div>
    );
  }
);

export default WizardPage;
