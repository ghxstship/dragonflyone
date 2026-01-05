"use client";

import { forwardRef, useEffect, useState } from "react";
import clsx from "clsx";
import { pageTransitionVariants } from "./PageTransition.variants.js";
import type { 
  PageTransitionProps, 
  StaggeredTransitionProps, 
  ScrollRevealProps 
} from "./PageTransition.types.js";

/**
 * PageTransition component - Smooth animations for page content.
 * 
 * @example
 * ```tsx
 * <PageTransition
 *   type="slide-up"
 *   duration={300}
 *   animateOnMount
 * >
 *   <div>Animated content</div>
 * </PageTransition>
 * ```
 */
export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  function PageTransition(
    {
      children,
      type = "fade",
      duration = 300,
      delay = 0,
      animateOnMount = true,
      show = true,
      easing = "ease-out",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(!animateOnMount);

    useEffect(() => {
      if (animateOnMount && show) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
      }
      setIsVisible(show);
    }, [animateOnMount, show, delay]);

    return (
      <div
        ref={ref}
        className={clsx(
          pageTransitionVariants({
            type,
            state: isVisible ? "animate" : "initial",
            className,
          })
        )}
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing,
          transitionDelay: `${delay}ms`,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

/**
 * StaggeredTransition component - Animate multiple children with staggered delays.
 * 
 * @example
 * ```tsx
 * <StaggeredTransition
 *   type="slide-up"
 *   staggerDelay={100}
 *   initialDelay={200}
 * >
 *   {items.map((item) => (
 *     <div key={item.id}>{item.content}</div>
 *   ))}
 * </StaggeredTransition>
 * ```
 */
export const StaggeredTransition = forwardRef<HTMLDivElement, StaggeredTransitionProps>(
  function StaggeredTransition(
    {
      children,
      type = "slide-up",
      duration = 300,
      staggerDelay = 100,
      initialDelay = 0,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div ref={ref} className={className} {...props}>
        {children.map((child, index) => (
          <PageTransition
            key={index}
            type={type}
            duration={duration}
            delay={initialDelay + index * staggerDelay}
            animateOnMount
          >
            {child}
          </PageTransition>
        ))}
      </div>
    );
  }
);

/**
 * ScrollReveal component - Animate content when it comes into view.
 * 
 * @example
 * ```tsx
 * <ScrollReveal
 *   type="slide-up"
 *   duration={500}
 *   threshold={0.1}
 *   once
 * >
 *   <div>Content that reveals on scroll</div>
 * </ScrollReveal>
 * ```
 */
export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  function ScrollReveal(
    {
      children,
      type = "slide-up",
      duration = 500,
      threshold = 0.1,
      rootMargin = "0px",
      once = true,
      className,
      ...props
    },
    ref
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      const element = ref && "current" in ref ? ref.current : null;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!once || !hasAnimated) {
              setIsVisible(true);
              setHasAnimated(true);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [ref, threshold, rootMargin, once, hasAnimated]);

    return (
      <PageTransition
        ref={ref}
        type={type}
        duration={duration}
        show={isVisible}
        animateOnMount={false}
        className={className}
        {...props}
      >
        {children}
      </PageTransition>
    );
  }
);

export default PageTransition;
