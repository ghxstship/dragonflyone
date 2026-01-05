"use client";

import { forwardRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { 
  ageVerificationModalVariants,
  ageVerificationModalContentVariants,
  ageVerificationModalIconVariants,
  ageVerificationModalTitleVariants,
  ageVerificationModalDescriptionVariants,
  ageVerificationModalFormVariants,
  ageVerificationModalButtonGroupVariants 
} from "./AgeVerificationModal.variants.js";
import type { AgeVerificationModalProps } from "./AgeVerificationModal.types.js";

/**
 * AgeVerificationModal component - Bold Contemporary Pop Art Adventure
 * 
 * Compliance with:
 * - COPPA (Children's Online Privacy Protection Act)
 * - Various state/country age verification requirements
 * - Event venue age restrictions
 * 
 * Features:
 * - Simple yes/no verification for basic age gates
 * - Date of birth input for stricter verification
 * - Stores verification in session storage
 * - Bold Contemporary Pop Art Adventure design
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <AgeVerificationModal
 *   open={isOpen}
 *   minimumAge={21}
 *   eventName="Bar Entry"
 *   onVerified={() => console.log('Verified')}
 *   onDenied={() => console.log('Denied')}
 * />
 * ```
 */
export const AgeVerificationModal = forwardRef<HTMLDivElement, AgeVerificationModalProps>(
  function AgeVerificationModal({
    open,
    onVerified,
    onDenied,
    minimumAge = 18,
    eventName,
    title,
    description,
    requireDateOfBirth = false,
    inverted = false,
    className,
    ...props
  }, ref) {
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [error, setError] = useState("");

    // Check if user is old enough based on date of birth
    const verifyAge = useCallback(() => {
      if (!requireDateOfBirth) {
        // Simple verification - assume user is old enough
        onVerified();
        return;
      }

      if (!dateOfBirth) {
        setError("Please enter your date of birth");
        return;
      }

      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Check if birthday has passed this year
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
      
      const actualAge = isBirthdayPassed ? age : age - 1;

      if (actualAge >= minimumAge) {
        onVerified();
        // Store verification in session storage
        sessionStorage.setItem('ageVerified', 'true');
        sessionStorage.setItem('ageVerifiedAt', new Date().toISOString());
      } else {
        setError(`You must be at least ${minimumAge} years old to continue`);
      }
    }, [dateOfBirth, minimumAge, requireDateOfBirth, onVerified]);

    // Handle denial
    const handleDeny = useCallback(() => {
      onDenied();
    }, [onDenied]);

    // Check if already verified
    const isAlreadyVerified = typeof window !== 'undefined' && 
      sessionStorage.getItem('ageVerified') === 'true';

    // Don't render if already verified or modal is closed
    if (isAlreadyVerified || !open) {
      return null;
    }

    return (
      <div 
        ref={ref} 
        className={ageVerificationModalVariants({ inverted, className })} 
        {...props}
      >
        {/* Modal Background */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-surface-primary border-2 border-border rounded-[var(--radius-modal)] shadow-hard max-w-md w-full">
            <div className={ageVerificationModalContentVariants({ inverted })}>
              {/* Warning Icon */}
              <div className={ageVerificationModalIconVariants({ inverted })}>
                <AlertTriangle className="w-16 h-16" />
              </div>

              {/* Title */}
              <h2 className={ageVerificationModalTitleVariants({ inverted })}>
                {title || "Age Verification Required"}
              </h2>

              {/* Description */}
              <p className={ageVerificationModalDescriptionVariants({ inverted })}>
                {description || (
                  <>
                    {eventName && (
                      <span>To access {eventName}, you must verify that you are at least {minimumAge} years old.</span>
                    )}
                    {!eventName && (
                      <span>You must be at least {minimumAge} years old to continue.</span>
                    )}
                    {requireDateOfBirth && (
                      <span className="block mt-2">Please enter your date of birth for verification.</span>
                    )}
                  </>
                )}
              </p>

              {/* Form */}
              <div className={ageVerificationModalFormVariants({ inverted })}>
                {requireDateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        setError("");
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border-2 rounded-button bg-surface-primary border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] ${
                        inverted ? "bg-surface-inverse border-border-inverse text-text-inverse" : ""
                      }`}
                    />
                    {error && (
                      <p className="text-sm text-error-600 mt-1">{error}</p>
                    )}
                  </div>
                )}

                {!requireDateOfBirth && (
                  <div className="text-sm text-text-muted">
                    <p>Are you at least {minimumAge} years old?</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={ageVerificationModalButtonGroupVariants({ inverted })}>
                <button
                  onClick={handleDeny}
                  className="flex-1 px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-surface-elevated border-border text-text-primary hover:bg-surface-hover"
                >
                  No
                </button>
                <button
                  onClick={verifyAge}
                  className="flex-1 px-4 py-2 border-2 rounded-button font-bold transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] bg-brand-primary border-brand-primary text-white hover:bg-brand-primary-hover shadow-primary"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AgeVerificationModal.displayName = "AgeVerificationModal";
