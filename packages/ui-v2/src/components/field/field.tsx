/**
 * Field Component
 * Form field wrapper with label, error, and help text
 */

import React, { forwardRef } from 'react';
import { Label } from '../../primitives/label';
import { Stack } from '../../primitives/stack';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface FieldProps {
  /**
   * Field label
   */
  label?: string;

  /**
   * ID for the input element
   */
  htmlFor?: string;

  /**
   * Required field indicator
   */
  required?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Help text
   */
  helpText?: string;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Input element (render prop)
   */
  children: React.ReactNode;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, htmlFor, required = false, error, helpText, className, children },
  ref
) {
  const hasError = Boolean(error);

  return (
    <Stack ref={ref} direction="vertical" spacing="2" className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required} className="text-sm font-medium">
          {label}
        </Label>
      )}

      {children}

      {error && (
        <Text size="sm" className="text-error-500" role="alert">
          {error}
        </Text>
      )}

      {helpText && !hasError && (
        <Text size="sm" className="text-text-tertiary">
          {helpText}
        </Text>
      )}
    </Stack>
  );
});
