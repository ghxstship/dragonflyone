import type { HTMLAttributes, ReactNode } from 'react';

export type FormWizardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  onComplete?: () => void;
};

export type FormStepProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  onNext?: () => void;
  onPrev?: () => void;
};
