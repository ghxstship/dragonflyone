"use client";

import { forwardRef, useRef, useEffect, useState, useCallback } from "react";
import { 
  scrollRevealVariants 
} from "./ScrollReveal.variants.js";
import type { 
  ScrollRevealProps, 
  ScrollRevealAnimation,
  ScrollRevealEasing 
} from "./ScrollReveal.types.js";

/**
 * ScrollReveal component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Scroll reveal animations with intersection observer
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ScrollReveal
 *   animation="slide-up"
 *   duration={600}
 *   distance={50}
 *   inverted={false}
 * >
 *   <div>Content to reveal</div>
 * </ScrollReveal>
 * ```
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  function ScrollReveal({
    children,
    animation = "fade" as ScrollRevealAnimation,
    duration = 600,
    delay = 0,
    threshold = 0.1,
    once = true,
    distance = 30,
    easing = "ease-out" as ScrollRevealEasing,
    disabled = false,
    inverted = false,
    className,
    style,
    ...props
  }, ref) {
    // State
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Merge refs
    const setRefs = useCallback((node: HTMLDivElement | null) => {
      if (elementRef) {
        (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }, [ref]);

    // Determine animation state
    const getAnimationState = () => {
      if (disabled) return "disabled";
      if (isVisible) return "animate";
      return "initial";
    };

    // Setup intersection observer
    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else if (!once) {
            setIsVisible(false);
          }
        },
        {
          threshold,
          rootMargin: '0px',
        }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [threshold, once]);

    // Handle delay with timeout
    useEffect(() => {
      if (isVisible && delay > 0) {
        const timer = setTimeout(() => {
          // Force re-render to apply animation after delay
          setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
      }
    }, [isVisible, delay]);

    // Get easing CSS value
    const getEasingValue = (easing: ScrollRevealEasing) => {
      switch (easing) {
        case "linear": return "linear";
        case "ease": return "ease";
        case "ease-in": return "ease-in";
        case "ease-out": return "ease-out";
        case "ease-in-out": return "ease-in-out";
        default: return "ease-out";
      }
    };

    // Custom styles for CSS variables
    const customStyles = {
      ...style,
      "--scroll-reveal-duration": `${duration}ms`,
      "--scroll-reveal-delay": `${delay}ms`,
      "--scroll-reveal-distance": `${distance}px`,
      "--scroll-reveal-easing": getEasingValue(easing),
      transition: `all ${duration}ms ${getEasingValue(easing)} ${delay}ms`,
    } as React.CSSProperties;

    return (
      <div
        ref={setRefs}
        className={scrollRevealVariants({ 
          animation, 
          state: getAnimationState(), 
          
          className 
        })}
        style={customStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";
