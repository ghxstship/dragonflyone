/**
 * Tabs Component
 * Tabbed interface for switching between views
 */

import React, { forwardRef, useState } from 'react';
import { Flex } from '../../primitives/flex';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /**
   * Array of tabs
   */
  tabs: Tab[];

  /**
   * Default active tab ID
   */
  defaultTab?: string;

  /**
   * Controlled active tab ID
   */
  activeTab?: string;

  /**
   * Tab change handler
   */
  onChange?: (tabId: string) => void;

  /**
   * Tabs variant
   */
  variant?: 'line' | 'enclosed' | 'pills';

  /**
   * Additional class names
   */
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, defaultTab, activeTab: controlledTab, onChange, variant = 'line', className },
  ref
) {
  const [uncontrolledTab, setUncontrolledTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledTab ?? uncontrolledTab;

  const handleTabChange = (tabId: string) => {
    if (!controlledTab) {
      setUncontrolledTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <Box ref={ref} className={cn('w-full', className)}>
      {/* Tab List */}
      <Flex
        role="tablist"
        gap={variant === 'pills' ? '2' : '0'}
        className={cn(
          variant === 'line' && 'border-b border-border-primary',
          variant === 'enclosed' && 'border-b border-border-primary'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              className={cn(
                'px-4 py-2 font-medium text-sm transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',

                // Line variant
                variant === 'line' &&
                  cn(
                    'border-b-2 -mb-px',
                    isActive
                      ? 'border-border-brand text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  ),

                // Enclosed variant
                variant === 'enclosed' &&
                  cn(
                    'border border-b-0 rounded-t-lg -mb-px',
                    isActive
                      ? 'border-border-primary bg-surface-primary text-text-primary'
                      : 'border-transparent text-text-secondary hover:bg-surface-secondary'
                  ),

                // Pills variant
                variant === 'pills' &&
                  cn(
                    'rounded-lg',
                    isActive
                      ? 'bg-surface-brand text-text-on-brand'
                      : 'text-text-secondary hover:bg-surface-secondary'
                  )
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </Flex>

      {/* Tab Panel */}
      {tabs.map((tab) => (
        <Box
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={tab.id}
          hidden={tab.id !== activeTab}
          className="py-4"
        >
          {tab.id === activeTab && tab.content}
        </Box>
      ))}
    </Box>
  );
});
