"use client";

import { forwardRef, HTMLAttributes, ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

export interface PageTransitionProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to animate */
  children: ReactNode;
  /** Animation type */
  type?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "wipe";
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Trigger animation on mount */
  animateOnMount?: boolean;
  /** Whether element is visible */
  show?: boolean;
  /** Easing function */
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
}

const animationClasses = {
  fade: {
    initial: "opacity-0",
    animate: "opacity-100",
  },
  "slide-up": {
    initial: "opacity-0 translate-y-8",
    animate: "opacity-100 translate-y-0",
  },
  "slide-down": {
    initial: "opacity-0 -translate-y-8",
    animate: "opacity-100 translate-y-0",
  },
  "slide-left": {
    initial: "opacity-0 translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  "slide-right": {
    initial: "opacity-0 -translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  zoom: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
  },
  wipe: {
    initial: "clip-path-[inset(0_100%_0_0)]",
    animate: "clip-path-[inset(0_0_0_0)]",
  },
};

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

    const animation = animationClasses[type];

    return (
      <div
        ref={ref}
        className={clsx(
          "transition-all",
          isVisible ? animation.animate : animation.initial,
          className
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

export interface StaggeredTransitionProps extends HTMLAttributes<HTMLDivElement> {
  /** Children to stagger */
  children: ReactNode[];
  /** Animation type for each child */
  type?: PageTransitionProps["type"];
  /** Base duration for each animation */
  duration?: number;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before first animation */
  initialDelay?: number;
}

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

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to reveal */
  children: ReactNode;
  /** Animation type */
  type?: PageTransitionProps["type"];
  /** Animation duration */
  duration?: number;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Only animate once */
  once?: boolean;
}

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
