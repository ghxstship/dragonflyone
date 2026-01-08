/**
 * PageFooter Pattern
 * Page footer with links and copyright
 */

import React, { forwardRef, ReactNode } from 'react';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { Separator } from '../../primitives/separator';
import { cn } from '../../utils/cn';

export interface FooterLink {
  label: string;
  href: string;
}

export interface PageFooterProps {
  /**
   * Copyright text
   */
  copyright?: string;

  /**
   * Footer links
   */
  links?: FooterLink[];

  /**
   * Additional content
   */
  children?: ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

export const PageFooter = forwardRef<HTMLElement, PageFooterProps>(
  function PageFooter({ copyright, links, children, className }, ref) {
    return (
      <footer ref={ref} className={cn('py-6 px-8', className)}>
        {children && (
          <>
            <div className="mb-4">{children}</div>
            <Separator />
          </>
        )}

        <Flex
          align="center"
          justify="between"
          gap="4"
          className={cn(children && 'mt-4')}
        >
          {/* Copyright */}
          {copyright && (
            <Text size="sm" className="text-text-secondary">
              {copyright}
            </Text>
          )}

          {/* Links */}
          {links && links.length > 0 && (
            <Flex gap="4" wrap="wrap">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </Flex>
          )}
        </Flex>
      </footer>
    );
  }
);
