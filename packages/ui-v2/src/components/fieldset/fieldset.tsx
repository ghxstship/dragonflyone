/**
 * Fieldset Component
 * Groups related form fields with legend
 */

import React, { forwardRef } from 'react';
import { Box } from '../../primitives/box';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { Flex } from '../../primitives/flex';
import { cn } from '../../utils/cn';

export interface FieldsetProps {
  /**
   * Fieldset legend (title)
   */
  legend?: string;

  /**
   * Fieldset description
   */
  description?: string;

  /**
   * Whether fieldset is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show border
   */
  bordered?: boolean;

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Children (form fields)
   */
  children?: React.ReactNode;
}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset(
    { legend, description, disabled, bordered = true, className, children },
    ref
  ) {
    return (
      <Box
        as="fieldset"
        ref={ref}
        disabled={disabled}
        className={cn(
          'p-4 rounded-lg',
          bordered && 'border border-border-primary',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        {(legend || description) && (
          <Flex direction="vertical" gap="1" className="mb-4">
            {legend && (
              <Heading
                as="legend"
                level="3"
                size="lg"
                className="text-text-primary"
              >
                {legend}
              </Heading>
            )}
            {description && (
              <Text size="sm" className="text-text-secondary">
                {description}
              </Text>
            )}
          </Flex>
        )}
        <Flex direction="vertical" gap="4">
          {children}
        </Flex>
      </Box>
    );
  }
);
