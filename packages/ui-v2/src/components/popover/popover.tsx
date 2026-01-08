/**
 * Popover Component
 * Floating content container
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface PopoverProps {
  /**
   * Trigger element
   */
  trigger: React.ReactElement;

  /**
   * Popover content
   */
  content: React.ReactNode;

  /**
   * Placement of popover
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Trigger type
   */
  triggerType?: 'click' | 'hover';

  /**
   * Additional class names for popover
   */
  className?: string;
}

const placementStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2',
  right: 'left-full top-1/2 -translate-y-1/2 translate-x-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2',
  left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2',
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, content, placement = 'bottom', triggerType = 'click', className },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerType === 'click' && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, triggerType]);

  const handleTrigger = () => {
    if (triggerType === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (triggerType === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (triggerType === 'hover') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {React.cloneElement(trigger, {
        onClick: handleTrigger,
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
      })}

      {isOpen && (
        <Box
          role="dialog"
          className={cn(
            'absolute z-popover',
            'bg-dropdown-bg border border-dropdown-border rounded-lg shadow-lg',
            'p-4',
            'animate-in fade-in-0 zoom-in-95',
            placementStyles[placement],
            className
          )}
        >
          {content}
        </Box>
      )}
    </div>
  );
});
