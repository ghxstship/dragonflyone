/**
 * PageHeader Pattern
 * Page-level header with title, breadcrumbs, and actions
 */

import React, { forwardRef, ReactNode } from 'react';
import { Flex } from '../../primitives/flex';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Breadcrumbs component
   */
  breadcrumbs?: ReactNode;

  /**
   * Actions (typically buttons or button group)
   */
  actions?: ReactNode;

  /**
   * Additional content below title/description
   */
  extra?: ReactNode;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional class names
   */
  className?: string;
}

const sizeStyles = {
  sm: {
    padding: 'px-4 py-3',
    titleSize: 'lg' as const,
    descSize: 'sm' as const,
  },
  md: {
    padding: 'px-6 py-4',
    titleSize: 'xl' as const,
    descSize: 'base' as const,
  },
  lg: {
    padding: 'px-8 py-6',
    titleSize: '2xl' as const,
    descSize: 'lg' as const,
  },
};

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    { title, description, breadcrumbs, actions, extra, size = 'md', className },
    ref
  ) {
    const styles = sizeStyles[size];

    return (
      <header ref={ref} className={cn(styles.padding, className)}>
        <Flex direction="vertical" gap="3">
          {/* Breadcrumbs */}
          {breadcrumbs && <div>{breadcrumbs}</div>}

          {/* Title and Actions Row */}
          <Flex align="center" justify="between" gap="4">
            <div className="flex-1 min-w-0">
              <Heading level="1" size={styles.titleSize} className="text-text-primary">
                {title}
              </Heading>
              {description && (
                <Text size={styles.descSize} className="text-text-secondary mt-1">
                  {description}
                </Text>
              )}
            </div>

            {actions && <Flex gap="2" className="flex-shrink-0">{actions}</Flex>}
          </Flex>

          {/* Extra Content */}
          {extra && <div>{extra}</div>}
        </Flex>
      </header>
    );
  }
);
