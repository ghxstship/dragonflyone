/**
 * Breadcrumb Component
 * Navigation breadcrumbs showing current location
 */

import React, { forwardRef } from 'react';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Separator element
   */
  separator?: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, separator = '/', className },
  ref
) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('', className)}>
      <Flex as="ol" align="center" gap="2" className="list-none">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = !isLast && (item.href || item.onClick);

          return (
            <React.Fragment key={index}>
              <li>
                {isLink ? (
                  <Text
                    as={item.href ? 'a' : 'button'}
                    href={item.href}
                    onClick={item.onClick}
                    size="sm"
                    className={cn(
                      'text-text-secondary hover:text-text-primary transition-colors',
                      item.href && 'underline-offset-2 hover:underline',
                      item.onClick && 'cursor-pointer'
                    )}
                  >
                    {item.label}
                  </Text>
                ) : (
                  <Text
                    size="sm"
                    className="text-text-primary font-medium"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </Text>
                )}
              </li>

              {!isLast && (
                <li aria-hidden="true" className="text-text-tertiary">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </Flex>
    </nav>
  );
});
