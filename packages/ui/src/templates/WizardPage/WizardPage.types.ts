import type { ReactNode } from "react";

export interface WizardStep {
  /**
   * Step title
   */
  title: string;
  
  /**
   * Optional step description
   */
  description?: string;
  
  /**
   * Step content
   */
  content: ReactNode;
}

export interface WizardPageProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Array of wizard steps
   */
  steps: WizardStep[];
  
  /**
   * Current step index (0-based)
   */
  currentStep?: number;
  
  /**
   * Step change handler
   */
  onStepChange?: (step: number) => void;
  
  /**
   * Completion handler
   */
  onComplete?: () => void;
  
  /**
   * Back navigation URL
   */
  backHref?: string;
  
  /**
   * Back button label
   */
  backLabel?: string;
  
  /**
   * Complete button label
   */
  completeLabel?: string;
  
  /**
   * Next button label
   */
  nextLabel?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
