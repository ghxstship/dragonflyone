/**
 * MFAForm Pattern
 * Multi-factor authentication form
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/card';
import { Button } from '../../primitives/button';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { Alert } from '../../components/alert';
import { cn } from '../../utils/cn';

export interface MFAFormProps {
  /**
   * Form title
   */
  title?: string;

  /**
   * Form description
   */
  description?: string;

  /**
   * Number of digits in code
   */
  digits?: number;

  /**
   * Whether form is loading
   */
  loading?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Submit handler
   */
  onSubmit: (code: string) => void | Promise<void>;

  /**
   * Resend code handler
   */
  onResendCode?: () => void;

  /**
   * Back handler
   */
  onBack?: () => void;

  /**
   * Additional class names
   */
  className?: string;
}

export const MFAForm = forwardRef<HTMLFormElement, MFAFormProps>(
  function MFAForm(
    {
      title = 'Two-Factor Authentication',
      description = 'Enter the 6-digit code from your authenticator app',
      digits = 6,
      loading = false,
      error,
      onSubmit,
      onResendCode,
      onBack,
      className,
    },
    ref
  ) {
    const [code, setCode] = useState(Array(digits).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      // Focus first input on mount
      inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
      // Only allow digits
      if (!/^\d*$/.test(value)) return;

      const newCode = [...code];
      newCode[index] = value.slice(-1); // Only take last character
      setCode(newCode);

      // Auto-focus next input
      if (value && index < digits - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, digits);
      const newCode = [...code];

      for (let i = 0; i < pastedData.length; i++) {
        if (/^\d$/.test(pastedData[i])) {
          newCode[i] = pastedData[i];
        }
      }

      setCode(newCode);

      // Focus last filled input or first empty
      const lastFilledIndex = newCode.findIndex((c) => !c);
      const focusIndex = lastFilledIndex === -1 ? digits - 1 : lastFilledIndex;
      inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const fullCode = code.join('');
      if (fullCode.length === digits) {
        await onSubmit(fullCode);
      }
    };

    const isComplete = code.every((digit) => digit !== '');

    return (
      <Card className={cn('w-full max-w-md', className)}>
        <form ref={ref} onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Flex direction="vertical" gap="4">
              {error && (
                <Alert variant="error" title="Verification failed">
                  {error}
                </Alert>
              )}

              <Flex justify="center" gap="2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className={cn(
                      'w-12 h-14 text-center text-2xl font-semibold',
                      'border-2 rounded-lg',
                      'focus:outline-none focus:border-brand-primary',
                      'transition-colors',
                      digit
                        ? 'border-brand-primary bg-surface-selected'
                        : 'border-border-primary bg-surface-primary',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  />
                ))}
              </Flex>

              {onResendCode && (
                <Text size="sm" className="text-center text-text-secondary">
                  Didn't receive a code?{' '}
                  <button
                    type="button"
                    onClick={onResendCode}
                    className="text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    Resend
                  </button>
                </Text>
              )}
            </Flex>
          </CardContent>

          <CardFooter>
            <Flex direction="vertical" gap="3" className="w-full">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!isComplete}
                className="w-full"
              >
                Verify
              </Button>

              {onBack && (
                <Text size="sm" className="text-center text-text-secondary">
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    ← Back
                  </button>
                </Text>
              )}
            </Flex>
          </CardFooter>
        </form>
      </Card>
    );
  }
);
