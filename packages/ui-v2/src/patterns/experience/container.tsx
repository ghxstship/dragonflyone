/**
 * Container Component
 * Responsive container for experience pages
 */

import React from 'react';
import './container.css';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide' | 'full';
  as?: React.ElementType;
}

/**
 * Responsive container with max-width and padding
 */
export function Container({
  children,
  className = '',
  size = 'default',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={`experience-container experience-container--${size} ${className}`}
    >
      {children}
    </Component>
  );
}

Container.displayName = 'Container';
