/**
 * Gap 12 Remediation: Onboarding Wizard Component
 * Role-specific onboarding flow UI with step navigation
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '../atoms/button.js';
import { H2, H3, Body, Label } from '../atoms/typography.js';
import { ProgressBar } from '../atoms/progress-bar.js';
import { Card, CardBody } from '../molecules/card.js';
import { Stack } from '../foundations/layout.js';
import { Check, ChevronRight, ChevronLeft } from '../atoms/icon.js';

// ============================================================================
// TYPES
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
  isOptional?: boolean;
  validationFn?: () => boolean | Promise<boolean>;
}

export interface OnboardingStepProps {
  onComplete: () => void;
  onSkip?: () => void;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
}

export interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: (data: Record<string, unknown>) => void;
  onExit?: () => void;
  initialData?: Record<string, unknown>;
  title?: string;
  subtitle?: string;
}

// ============================================================================
// ONBOARDING WIZARD COMPONENT
// ============================================================================

export function OnboardingWizard({
  steps,
  onComplete,
  onExit,
  initialData = {},
  title = 'Welcome',
  subtitle = 'Let\'s get you set up',
}: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [data, setDataState] = useState<Record<string, unknown>>(initialData);
  const [isValidating, setIsValidating] = useState(false);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const setData = useCallback((key: string, value: unknown) => {
    setDataState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStepComplete = useCallback(async () => {
    if (currentStep.validationFn) {
      setIsValidating(true);
      const isValid = await currentStep.validationFn();
      setIsValidating(false);
      if (!isValid) return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep.id]));

    if (isLastStep) {
      onComplete(data);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStep, isLastStep, onComplete, data]);

  const handleSkip = useCallback(() => {
    if (currentStep.isOptional) {
      if (isLastStep) {
        onComplete(data);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  }, [currentStep.isOptional, isLastStep, onComplete, data]);

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const StepComponent = currentStep.component;

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-border bg-surface-primary">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <H2>{title}</H2>
              <Body className="text-text-muted">{subtitle}</Body>
            </div>
            {onExit && (
              <Button variant="ghost" onClick={onExit}>
                Exit
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-surface-secondary border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-text-muted">
              Step {currentStepIndex + 1} of {steps.length}
            </Label>
            <Label className="text-text-muted">
              {Math.round(progress)}% complete
            </Label>
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-surface-primary border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-button border-2 transition-colors ${
                    isCurrent
                      ? 'bg-primary text-text-primary border-primary'
                      : isCompleted
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-surface-secondary text-text-muted border-border'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-xs font-weight-bold">
                      {index + 1}
                    </span>
                  )}
                  <span className="text-sm font-weight-medium whitespace-nowrap">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card>
            <CardBody>
              <Stack gap={6}>
                <div>
                  <H3>{currentStep.title}</H3>
                  <Body className="text-text-muted mt-2">
                    {currentStep.description}
                  </Body>
                  {currentStep.isOptional && (
                    <Label className="text-text-disabled mt-1">Optional step</Label>
                  )}
                </div>

                <StepComponent
                  onComplete={handleStepComplete}
                  onSkip={currentStep.isOptional ? handleSkip : undefined}
                  data={data}
                  setData={setData}
                />
              </Stack>
            </CardBody>
          </Card>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t-2 border-border bg-surface-primary">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={isFirstStep}
              icon={<ChevronLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep.isOptional && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <Button
                variant="solid"
                onClick={handleStepComplete}
                disabled={isValidating}
                icon={isLastStep ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {isValidating ? 'Validating...' : isLastStep ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// COMMON STEP COMPONENTS
// ============================================================================

export function WelcomeStep({ onComplete }: OnboardingStepProps) {
  return (
    <Stack gap={6}>
      <div className="text-center py-8">
        <div className="w-24 h-24 mx-auto bg-primary/10 rounded-modal flex items-center justify-center mb-6">
          <span className="text-4xl">👋</span>
        </div>
        <H3>Welcome to GHXSTSHIP</H3>
        <Body className="text-text-muted mt-2 max-w-md mx-auto">
          We&apos;re excited to have you on board. Let&apos;s get your account set up
          so you can start using all the features available to you.
        </Body>
      </div>
      <div className="flex justify-center">
        <Button variant="solid" onClick={onComplete}>
          Get Started
        </Button>
      </div>
    </Stack>
  );
}

export function ProfileStep({ data, setData, onComplete }: OnboardingStepProps) {
  const fullName = (data.fullName as string) || '';
  const bio = (data.bio as string) || '';

  return (
    <Stack gap={4}>
      <div>
        <Label className="mb-2 block">Full Name</Label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setData('fullName', e.target.value)}
          className="w-full px-4 py-3 border-2 border-border rounded-button focus:border-primary focus:outline-none"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <Label className="mb-2 block">Bio (Optional)</Label>
        <textarea
          value={bio}
          onChange={(e) => setData('bio', e.target.value)}
          className="w-full px-4 py-3 border-2 border-border rounded-button focus:border-primary focus:outline-none min-h-[100px]"
          placeholder="Tell us about yourself"
        />
      </div>
      <div className="flex justify-end">
        <Button variant="solid" onClick={onComplete} disabled={!fullName.trim()}>
          Continue
        </Button>
      </div>
    </Stack>
  );
}

export function PreferencesStep({ data, setData, onComplete }: OnboardingStepProps) {
  const notifications = (data.notifications as boolean) ?? true;
  const theme = (data.theme as string) || 'system';

  return (
    <Stack gap={4}>
      <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-card">
        <div>
          <Body className="font-weight-bold">Email Notifications</Body>
          <Label className="text-text-muted">Receive updates about your account</Label>
        </div>
        <button
          onClick={() => setData('notifications', !notifications)}
          className={`w-12 h-6 rounded-full transition-colors ${
            notifications ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
              notifications ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div>
        <Label className="mb-2 block">Theme Preference</Label>
        <div className="flex gap-2">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setData('theme', t)}
              className={`flex-1 px-4 py-3 rounded-button border-2 capitalize transition-colors ${
                theme === t
                  ? 'bg-primary text-text-primary border-primary'
                  : 'bg-surface-primary text-text-primary border-border hover:border-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="solid" onClick={onComplete}>
          Continue
        </Button>
      </div>
    </Stack>
  );
}

export function CompletionStep({ onComplete }: OnboardingStepProps) {
  return (
    <Stack gap={6}>
      <div className="text-center py-8">
        <div className="w-24 h-24 mx-auto bg-success/10 rounded-modal flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-success" />
        </div>
        <H3>You&apos;re All Set!</H3>
        <Body className="text-text-muted mt-2 max-w-md mx-auto">
          Your account is now configured and ready to use. You can always update
          your settings later from your profile page.
        </Body>
      </div>
      <div className="flex justify-center">
        <Button variant="solid" onClick={onComplete}>
          Start Using GHXSTSHIP
        </Button>
      </div>
    </Stack>
  );
}

