/**
 * Content Grid Component
 * Two-column layout with sticky sidebar for experience pages
 */

import React from 'react';
import { Container } from './container';
import './content-grid.css';

export interface ContentGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column grid layout
 * Desktop: Main content (left) + Sticky sidebar (right)
 * Mobile: Stacked layout
 */
export function ContentGrid({ children, className = '' }: ContentGridProps) {
  const childArray = React.Children.toArray(children);

  return (
    <Container className={`content-grid ${className}`}>
      <div className="content-grid__wrapper">
        <div className="content-grid__main">{childArray[0]}</div>
        <aside className="content-grid__sidebar">{childArray[1]}</aside>
      </div>
    </Container>
  );
}

ContentGrid.displayName = 'ContentGrid';
