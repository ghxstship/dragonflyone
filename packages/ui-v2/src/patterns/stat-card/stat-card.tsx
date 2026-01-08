/**
 * StatCard Pattern
 * Statistics card for dashboards
 */

import React, { forwardRef, ReactNode } from 'react';
import { Card } from '../../components/card';
import { Flex } from '../../primitives/flex';
import { Heading } from '../../primitives/heading';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  /**
   * Stat title/label
   */
  title: string;

  /**
   * Stat value
   */
  value: string | number;

  /**
   * Icon
   */
  icon?: ReactNode;

  /**
   * Change indicator (e.g., "+12%" or "-5%")
   */
  change?: string;

  /**
   * Change type (affects color)
   */
  changeType?: 'positive' | 'negative' | 'neutral';

  /**
   * Description or helper text
   */
  description?: string;

  /**
   * Whether card is loading
   */
  loading?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

const changeTypeStyles = {
  positive: 'text-feedback-success',
  negative: 'text-feedback-error',
  neutral: 'text-text-secondary',
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  function StatCard(
    {
      title,
      value,
      icon,
      change,
      changeType = 'neutral',
      description,
      loading = false,
      className,
    },
    ref
  ) {
    return (
      <Card ref={ref} variant="elevated" padding="comfortable" className={className}>
        <Flex direction="vertical" gap="3">
          {/* Header */}
          <Flex align="center" justify="between">
            <Text size="sm" className="text-text-secondary font-medium">
              {title}
            </Text>
            {icon && <div className="text-text-secondary">{icon}</div>}
          </Flex>

          {/* Value */}
          {loading ? (
            <div className="h-9 w-24 bg-surface-secondary animate-pulse rounded" />
          ) : (
            <Heading level="2" size="2xl" className="text-text-primary">
              {value}
            </Heading>
          )}

          {/* Change and Description */}
          {(change || description) && (
            <Flex align="center" gap="2" wrap="wrap">
              {change && (
                <Text
                  size="sm"
                  className={cn('font-medium', changeTypeStyles[changeType])}
                >
                  {change}
                </Text>
              )}
              {description && (
                <Text size="sm" className="text-text-secondary">
                  {description}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </Card>
    );
  }
);
