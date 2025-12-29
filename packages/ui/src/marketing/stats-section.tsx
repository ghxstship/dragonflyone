"use client";

import { forwardRef, useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { Container, Stack, Grid } from "../foundations/layout.js";
import { Kicker } from "../atoms/kicker.js";
import { Body, H2 } from "../atoms/typography.js";

/**
 * StatsSection - Animated statistics display
 * 2026 Best Practices:
 * - Animated counters on scroll into view
 * - Quantified value propositions
 * - Social proof through numbers
 * Bold Contemporary Pop Art Adventure Design System
 */

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  description?: string;
}

export interface StatsSectionProps {
  /** Section kicker text */
  kicker?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Stats to display */
  stats: StatItem[];
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Background color */
  background?: "black" | "ink" | "primary" | "accent";
  /** Animate numbers on scroll */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Content alignment */
  align?: "left" | "center";
  className?: string;
}

function useCountUp(
  end: number,
  duration: number,
  shouldAnimate: boolean
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(end);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldAnimate]);

  return count;
}

function AnimatedStat({
  stat,
  animate,
  duration,
  isVisible,
}: {
  stat: StatItem;
  animate: boolean;
  duration: number;
  isVisible: boolean;
}) {
  const count = useCountUp(stat.value, duration, animate && isVisible);

  return (
    <Stack gap={2} className="text-center">
      <div className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
        {stat.prefix}
        {animate ? count.toLocaleString() : stat.value.toLocaleString()}
        {stat.suffix}
      </div>
      <Body className="text-white font-semibold uppercase tracking-wider">
        {stat.label}
      </Body>
      {stat.description && (
        <Body size="sm" className="text-white/70">
          {stat.description}
        </Body>
      )}
    </Stack>
  );
}

export const StatsSection = forwardRef<HTMLElement, StatsSectionProps>(
  function StatsSection(
    {
      kicker,
      title,
      description,
      stats,
      columns = 4,
      background = "primary",
      animate = true,
      animationDuration = 2000,
      align = "center",
      className,
    },
    ref
  ) {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );

      const currentRef = sectionRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, []);

    const bgClasses = {
      black: "bg-black",
      ink: "bg-ink-950",
      primary: "bg-primary",
      accent: "bg-accent",
    };

    const colClasses = {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
    };

    return (
      <section
        ref={(node) => {
          (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={clsx("py-16 md:py-24", bgClasses[background], className)}
      >
        <Container size="xl">
          {/* Section Header */}
          {(kicker || title || description) && (
            <Stack
              gap={4}
              className={clsx(
                "mb-12",
                align === "center" ? "text-center items-center" : "text-left"
              )}
            >
              {kicker && <Kicker className="text-white/80">{kicker}</Kicker>}
              {title && <H2 className="text-white">{title}</H2>}
              {description && (
                <Body size="lg" className="text-white/80 max-w-2xl">
                  {description}
                </Body>
              )}
            </Stack>
          )}

          {/* Stats Grid */}
          <Grid cols={columns} gap={8} className={colClasses[columns]}>
            {stats.map((stat) => (
              <AnimatedStat
                key={stat.id}
                stat={stat}
                animate={animate}
                duration={animationDuration}
                isVisible={isVisible}
              />
            ))}
          </Grid>
        </Container>
      </section>
    );
  }
);

export default StatsSection;
