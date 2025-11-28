"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Position relative to trigger */
  position?: "top" | "bottom" | "left" | "right";
  /** Delay before showing (ms) */
  delay?: number;
  /** Trigger element */
  children: React.ReactNode;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className for tooltip */
  className?: string;
}

export function Tooltip({
  content,
  position = "top",
  delay = 200,
  children,
  disabled = false,
  inverted = false,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

    setCoords({ top, left });
  };

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={clsx(
            "fixed z-tooltip font-code text-sm tracking-wide font-medium",
            "px-4 py-2 max-w-xs pointer-events-none",
            "border-2 rounded-[var(--radius-tooltip)]",
            "transition-all duration-100",
            // Speech bubble style with accent shadow
            inverted 
              ? "bg-white text-black border-black shadow-[3px_3px_0_hsl(239,84%,67%)]" 
              : "bg-black text-white border-white shadow-[3px_3px_0_hsl(239,84%,67%)]",
            isVisible ? "opacity-100 animate-zoom-in" : "opacity-0",
            className
          )}
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}

export default Tooltip;
