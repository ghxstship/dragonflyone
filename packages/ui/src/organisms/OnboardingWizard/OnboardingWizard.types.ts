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
