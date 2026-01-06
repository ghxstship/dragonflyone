"use client";

import { forwardRef, useEffect, useState } from "react";
import clsx from "clsx";
import { successAnimationVariants } from "./SuccessAnimation.variants.js";
import type { SuccessAnimationProps } from "./SuccessAnimation.types.js";

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

const checkmarkSizes = {
  sm: { viewBox: "0 0 24 24", strokeWidth: 3 },
  md: { viewBox: "0 0 24 24", strokeWidth: 2.5 },
  lg: { viewBox: "0 0 24 24", strokeWidth: 2 },
};

/**
 * SuccessAnimation component - Animated checkmark for form submissions
 * 
 * Features:
 * - Smooth circle draw animation
 * - Checkmark stroke animation
 * - Configurable sizes
 * - Auto-hide option
 * 
 * @example
 * ```tsx
 * <SuccessAnimation
 *   show={showSuccess}
 *   size="md"
 *   autoHideDuration={3000}
 *   onComplete={() => setShowSuccess(false)}
 * />
 * ```
 */
export const SuccessAnimation = forwardRef<HTMLDivElement, SuccessAnimationProps>(
  function SuccessAnimation(
    {
      show,
      size = "md",
      autoHideDuration = 0,
      onComplete,
      inverted = false,
      className,
      ...props
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
      if (show) {
        setIsVisible(true);
        setAnimationComplete(false);
        
        // Animation duration is ~600ms
        const completeTimer = setTimeout(() => {
          setAnimationComplete(true);
          onComplete?.();
        }, 600);

        // Auto-hide if duration is set
        if (autoHideDuration > 0) {
          const hideTimer = setTimeout(() => {
            setIsVisible(false);
          }, autoHideDuration);
          return () => {
            clearTimeout(completeTimer);
            clearTimeout(hideTimer);
          };
        }

        return () => clearTimeout(completeTimer);
      } else {
        setIsVisible(false);
        setAnimationComplete(false);
      }
    }, [show, autoHideDuration, onComplete]);

    if (!isVisible) return null;

    const { viewBox, strokeWidth } = checkmarkSizes[size];

    return (
      <div
        ref={ref}
        className={clsx(
          successAnimationVariants({
            size,
            
            className,
          }),
          sizeClasses[size]
        )}
        role="status"
        aria-label="Success"
        {...props}
      >
        <svg
          viewBox={viewBox}
          className={clsx(
            "w-full h-full",
            inverted ? "text-success-400" : "text-success-500"
          )}
        >
          {/* Circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={clsx(
              "origin-center",
              animationComplete ? "opacity-100" : "animate-[draw-circle_0.4s_ease-out_forwards]"
            )}
            style={{
              strokeDasharray: 63,
              strokeDashoffset: animationComplete ? 0 : 63,
              animation: !animationComplete ? "draw-circle 0.4s ease-out forwards" : undefined,
            }}
          />
          {/* Checkmark */}
          <path
            d="M6 12l4 4 8-8"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 20,
              strokeDashoffset: animationComplete ? 0 : 20,
              animation: !animationComplete ? "draw-check 0.3s ease-out 0.3s forwards" : undefined,
            }}
          />
        </svg>
      </div>
    );
  }
);

export default SuccessAnimation;
