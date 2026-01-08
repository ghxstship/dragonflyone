/**
 * Tooltip Component
 * Accessible tooltip with positioning
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode;

  /**
   * Placement of the tooltip
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Delay before showing (ms)
   */
  delay?: number;

  /**
   * Whether tooltip is disabled
   */
  disabled?: boolean;

  /**
   * Additional class names for tooltip
   */
  className?: string;

  /**
   * Children (trigger element)
   */
  children: React.ReactElement;
}

const placementStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2',
  right: 'left-full top-1/2 -translate-y-1/2 translate-x-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2',
  left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2',
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, placement = 'top', delay = 200, disabled = false, className, children },
  ref
) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleMouseEnter,
        onBlur: handleMouseLeave,
      })}

      {isVisible && !disabled && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-tooltip px-2 py-1 text-xs font-medium',
            'bg-tooltip-bg text-tooltip-text rounded-md shadow-lg',
            'pointer-events-none',
            'animate-in fade-in-0 zoom-in-95',
            placementStyles[placement],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
});
