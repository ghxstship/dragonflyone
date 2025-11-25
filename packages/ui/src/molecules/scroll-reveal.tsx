'use client';

import { forwardRef, useRef, useEffect, useState, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to reveal on scroll */
  children: ReactNode;
  /** Animation type */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'rotate';
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Threshold for triggering animation (0-1) */
  threshold?: number;
  /** Whether to animate only once */
  once?: boolean;
  /** Distance for slide animations in pixels */
  distance?: number;
  /** Easing function */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Whether element is disabled */
  disabled?: boolean;
}

const animationStyles = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  'slide-up': {
    initial: { opacity: 0, transform: 'translateY(var(--distance))' },
    animate: { opacity: 1, transform: 'translateY(0)' },
  },
  'slide-down': {
    initial: { opacity: 0, transform: 'translateY(calc(var(--distance) * -1))' },
    animate: { opacity: 1, transform: 'translateY(0)' },
  },
  'slide-left': {
    initial: { opacity: 0, transform: 'translateX(var(--distance))' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  'slide-right': {
    initial: { opacity: 0, transform: 'translateX(calc(var(--distance) * -1))' },
    animate: { opacity: 1, transform: 'translateX(0)' },
  },
  scale: {
    initial: { opacity: 0, transform: 'scale(0.8)' },
    animate: { opacity: 1, transform: 'scale(1)' },
  },
  rotate: {
    initial: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' },
    animate: { opacity: 1, transform: 'rotate(0) scale(1)' },
  },
};

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  function ScrollReveal(
    {
      children,
      animation = 'fade',
      duration = 600,
      delay = 0,
      threshold = 0.1,
      once = true,
      distance = 40,
      easing = 'ease-out',
      disabled = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (disabled) {
        setIsVisible(true);
        return;
      }

      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!hasAnimated || !once) {
              setIsVisible(true);
              if (once) {
                setHasAnimated(true);
                observer.unobserve(element);
              }
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [threshold, once, hasAnimated, disabled]);

    const animStyle = animationStyles[animation];
    const currentStyle = isVisible ? animStyle.animate : animStyle.initial;

    return (
      <div
        ref={(node) => {
          (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={clsx('scroll-reveal', className)}
        style={{
          ...currentStyle,
          '--distance': `${distance}px`,
          transition: `all ${duration}ms ${easing} ${delay}ms`,
          willChange: 'opacity, transform',
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface ParallaxProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to apply parallax effect */
  children: ReactNode;
  /** Parallax speed multiplier (negative = opposite direction) */
  speed?: number;
  /** Direction of parallax effect */
  direction?: 'vertical' | 'horizontal';
  /** Whether to disable on mobile */
  disableOnMobile?: boolean;
}

export const Parallax = forwardRef<HTMLDivElement, ParallaxProps>(
  function Parallax(
    {
      children,
      speed = 0.5,
      direction = 'vertical',
      disableOnMobile = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
      if (disableOnMobile && isMobile) return;

      const handleScroll = () => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;
        
        setOffset(distanceFromCenter * speed);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, disableOnMobile, isMobile]);

    const transform = direction === 'vertical'
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`;

    return (
      <div
        ref={(node) => {
          (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={clsx('parallax', className)}
        style={{
          transform: (disableOnMobile && isMobile) ? undefined : transform,
          willChange: 'transform',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface StaggerChildrenProps extends HTMLAttributes<HTMLDivElement> {
  /** Children to stagger */
  children: ReactNode;
  /** Delay between each child in ms */
  staggerDelay?: number;
  /** Base animation duration in ms */
  duration?: number;
  /** Animation type for children */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  /** Threshold for triggering animation */
  threshold?: number;
  /** Whether to animate only once */
  once?: boolean;
}

export const StaggerChildren = forwardRef<HTMLDivElement, StaggerChildrenProps>(
  function StaggerChildren(
    {
      children,
      staggerDelay = 100,
      duration = 500,
      animation = 'fade',
      threshold = 0.1,
      once = true,
      className,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, [threshold, once]);

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={clsx('stagger-children', className)}
        {...props}
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <ScrollReveal
                key={index}
                animation={animation}
                duration={duration}
                delay={isVisible ? index * staggerDelay : 0}
                threshold={0}
                once={once}
                disabled={!isVisible}
              >
                {child}
              </ScrollReveal>
            ))
          : children}
      </div>
    );
  }
);
