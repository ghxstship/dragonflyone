"use client";

import { forwardRef, useState, ReactNode, Children, isValidElement, cloneElement } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type FormWizardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  onComplete?: () => void;
};

export const FormWizard = forwardRef<HTMLDivElement, FormWizardProps>(
  function FormWizard({ children, onComplete, className, ...props }, ref) {
    const steps = Children.toArray(children);
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete?.();
      }
    };

    const prevStep = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((_, index) => (
              <div key={index} className="flex-1">
                <div
                  className={clsx(
                    "h-1 transition-colors",
                    index <= currentStep ? "bg-black" : "bg-grey-300"
                  )}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((step, index) => {
              if (isValidElement(step) && step.props.title) {
                return (
                  <span
                    key={index}
                    className={clsx(
                      "font-code text-xs uppercase tracking-widest",
                      index <= currentStep ? "text-black" : "text-grey-400"
                    )}
                  >
                    {step.props.title}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {Children.map(steps, (step, index) => {
            if (index === currentStep && isValidElement(step)) {
              return cloneElement(step as React.ReactElement<FormStepProps>, { onNext: nextStep, onPrev: prevStep });
            }
            return null;
          })}
        </div>
      </div>
    );
  }
);

export type FormStepProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  onNext?: () => void;
  onPrev?: () => void;
};

export const FormStep = forwardRef<HTMLDivElement, FormStepProps>(
  function FormStep({ className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("", className)} {...props}>
        {children}
      </div>
    );
  }
);
