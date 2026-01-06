/**
 * EmptyState Component
 * Display when there's no data to show
 */

import React, { forwardRef } from 'react';
import { Stack } from '../../primitives/stack';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  /**
   * Icon or illustration
   */
  icon?: React.ReactNode;

  /**
   * Title
   */
  title: string;

  /**
   * Description
   */
  description?: string;

  /**
   * Action button(s)
   */
  action?: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, className },
  ref
) {
  return (
    <Stack
      ref={ref}
      direction="vertical"
      spacing="4"
      align="center"
      className={cn('py-12 px-4 text-center', className)}
    >
      {icon && <div className="text-text-tertiary">{icon}</div>}

      <Stack direction="vertical" spacing="2" align="center">
        <Heading level="3" size="lg" className="text-text-primary">
          {title}
        </Heading>

        {description && (
          <Text size="base" className="text-text-secondary max-w-md">
            {description}
          </Text>
        )}
      </Stack>

      {action && <div className="mt-2">{action}</div>}
    </Stack>
  );
});
