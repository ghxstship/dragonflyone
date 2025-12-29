"use client";

import { forwardRef, useState, useCallback } from "react";
import type { HTMLAttributes } from "react";
import { Modal } from "../organisms/modal.js";
import { Button } from "../atoms/button.js";
import { Body, H2, Label } from "../atoms/typography.js";
import { Stack } from "../foundations/layout.js";
import { Input } from "../atoms/input.js";

export interface AgeVerificationModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when verification is successful */
  onVerified: () => void;
  /** Callback when verification fails or is cancelled */
  onDenied: () => void;
  /** Minimum age required */
  minimumAge?: number;
  /** Event name for context */
  eventName?: string;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Whether to show date of birth input (more strict verification) */
  requireDateOfBirth?: boolean;
}

/**
 * AgeVerificationModal - Age gate component for age-restricted events
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
    className,
    ...props
  }, ref) {
    const [birthDate, setBirthDate] = useState({ month: "", day: "", year: "" });
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const calculateAge = useCallback((month: number, day: number, year: number): number => {
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }, []);

    const handleDateVerification = useCallback(() => {
      setError(null);
      setIsVerifying(true);

      const month = parseInt(birthDate.month, 10);
      const day = parseInt(birthDate.day, 10);
      const year = parseInt(birthDate.year, 10);

      // Validate inputs
      if (isNaN(month) || isNaN(day) || isNaN(year)) {
        setError("Please enter a valid date of birth");
        setIsVerifying(false);
        return;
      }

      if (month < 1 || month > 12) {
        setError("Please enter a valid month (1-12)");
        setIsVerifying(false);
        return;
      }

      if (day < 1 || day > 31) {
        setError("Please enter a valid day (1-31)");
        setIsVerifying(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        setError("Please enter a valid year");
        setIsVerifying(false);
        return;
      }

      const age = calculateAge(month, day, year);

      // Simulate verification delay
      setTimeout(() => {
        setIsVerifying(false);
        if (age >= minimumAge) {
          // Store verification in session storage
          sessionStorage.setItem("age_verified", JSON.stringify({
            verified: true,
            minimumAge,
            timestamp: Date.now(),
          }));
          onVerified();
        } else {
          setError(`You must be at least ${minimumAge} years old to access this content.`);
          onDenied();
        }
      }, 500);
    }, [birthDate, minimumAge, calculateAge, onVerified, onDenied]);

    const handleSimpleVerification = useCallback((isOfAge: boolean) => {
      if (isOfAge) {
        sessionStorage.setItem("age_verified", JSON.stringify({
          verified: true,
          minimumAge,
          timestamp: Date.now(),
        }));
        onVerified();
      } else {
        onDenied();
      }
    }, [minimumAge, onVerified, onDenied]);

    const defaultTitle = `Age Verification Required`;
    const defaultDescription = eventName
      ? `You must be at least ${minimumAge} years old to purchase tickets for "${eventName}".`
      : `You must be at least ${minimumAge} years old to access this content.`;

    return (
      <Modal
        ref={ref}
        open={open}
        size="sm"
        showClose={false}
        className={className}
        {...props}
      >
        <Stack gap={6} className="text-center">
          {/* Age badge */}
          <div className="mx-auto flex size-20 items-center justify-center border-4 border-black bg-brand-amber shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <span className="font-heading text-3xl font-bold text-black">{minimumAge}+</span>
          </div>

          {/* Title */}
          <H2 className="text-ink-950">{title || defaultTitle}</H2>

          {/* Description */}
          <Body className="text-grey-700">
            {description || defaultDescription}
          </Body>

          {requireDateOfBirth ? (
            /* Date of Birth Verification */
            <Stack gap={4}>
              <Label size="sm" className="text-grey-600">
                ENTER YOUR DATE OF BIRTH
              </Label>
              
              <div className="flex gap-2 justify-center">
                <Input
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  value={birthDate.month}
                  onChange={(e) => setBirthDate(prev => ({ ...prev, month: e.target.value }))}
                  className="w-16 text-center"
                  aria-label="Month"
                />
                <Input
                  type="text"
                  placeholder="DD"
                  maxLength={2}
                  value={birthDate.day}
                  onChange={(e) => setBirthDate(prev => ({ ...prev, day: e.target.value }))}
                  className="w-16 text-center"
                  aria-label="Day"
                />
                <Input
                  type="text"
                  placeholder="YYYY"
                  maxLength={4}
                  value={birthDate.year}
                  onChange={(e) => setBirthDate(prev => ({ ...prev, year: e.target.value }))}
                  className="w-20 text-center"
                  aria-label="Year"
                />
              </div>

              {error && (
                <Body size="sm" className="text-red-600" role="alert">
                  {error}
                </Body>
              )}

              <Stack direction="horizontal" gap={3} className="justify-center mt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => onDenied()}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  size="md"
                  onClick={handleDateVerification}
                  disabled={isVerifying || !birthDate.month || !birthDate.day || !birthDate.year}
                >
                  {isVerifying ? "Verifying..." : "Verify Age"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            /* Simple Yes/No Verification */
            <Stack gap={4}>
              <Body size="sm" className="text-grey-600">
                By clicking &quot;Yes&quot;, you confirm that you are {minimumAge} years of age or older.
              </Body>

              <Stack direction="horizontal" gap={3} className="justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleSimpleVerification(false)}
                >
                  No, I&apos;m Under {minimumAge}
                </Button>
                <Button
                  variant="solid"
                  size="lg"
                  onClick={() => handleSimpleVerification(true)}
                >
                  Yes, I&apos;m {minimumAge}+
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Legal disclaimer */}
          <Body size="xs" className="text-grey-500">
            By proceeding, you agree to our{" "}
            <a href="/legal/terms" className="text-primary-600 underline">Terms of Service</a>
            {" "}and confirm that you meet the age requirements.
          </Body>
        </Stack>
      </Modal>
    );
  }
);

/**
 * Hook to check if age has been verified in the current session
 */
export function useAgeVerification(minimumAge: number = 18) {
  const checkVerification = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    
    try {
      const stored = sessionStorage.getItem("age_verified");
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      
      // Check if verification is still valid (24 hour expiry)
      const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - data.timestamp > expiryTime) {
        sessionStorage.removeItem("age_verified");
        return false;
      }
      
      // Check if verified for the required age
      return data.verified && data.minimumAge >= minimumAge;
    } catch {
      return false;
    }
  }, [minimumAge]);

  const clearVerification = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("age_verified");
    }
  }, []);

  return {
    isVerified: checkVerification(),
    checkVerification,
    clearVerification,
  };
}

export default AgeVerificationModal;
