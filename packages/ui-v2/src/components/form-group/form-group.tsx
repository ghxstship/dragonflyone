/**
 * FormGroup Component
 * Groups multiple form fields together
 */

import React, { forwardRef } from 'react';
import { Stack } from '../../primitives/stack';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface FormGroupProps {
  /**
   * Form group title
   */
  title?: string;

  /**
   * Form group description
   */
  description?: string;

  /**
   * Spacing between fields
   */
  spacing?: '2' | '3' | '4' | '6';

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children (form fields)
   */
  children: React.ReactNode;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(function FormGroup(
  { title, description, spacing = '4', className, children },
  ref
) {
  return (
    <Stack
      ref={ref}
      direction="vertical"
      spacing={spacing}
      className={cn('w-full', className)}
    >
      {(title || description) && (
        <Stack direction="vertical" spacing="1">
          {title && (
            <Heading level="3" size="base" className="text-text-primary">
              {title}
            </Heading>
          )}
          {description && (
            <Text size="sm" className="text-text-secondary">
              {description}
            </Text>
          )}
        </Stack>
      )}

      <Stack direction="vertical" spacing={spacing}>
        {children}
      </Stack>
    </Stack>
  );
});
