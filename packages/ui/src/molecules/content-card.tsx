import { forwardRef } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Kicker } from "../atoms/kicker.js";
import { H3 } from "../atoms/typography.js";
import { Body } from "../atoms/typography.js";
import { List, ListItem } from "../atoms/list.js";
import { Text } from "../atoms/text.js";
import { Stack } from "../foundations/layout.js";

export type ContentCardProps = HTMLAttributes<HTMLElement> & {
  /** Small uppercase label at the top */
  kicker?: string;
  /** Card title */
  title: string;
  /** Description text */
  description?: string;
  /** Bullet points list */
  bullets?: string[];
  /** Custom bullet prefix */
  bulletPrefix?: string | ReactNode;
  /** Card variant */
  variant?: "bordered" | "surface" | "ghost";
  /** Padding size */
  padding?: "sm" | "md" | "lg";
  /** Additional content after bullets */
  footer?: ReactNode;
};

/**
 * ContentCard - Reusable card pattern for feature lists, roadmap items, etc.
 * Commonly used across ATLVS, COMPVSS, and GVTEWAY landing pages
 */
export const ContentCard = forwardRef<HTMLElement, ContentCardProps>(
  function ContentCard(
    {
      kicker,
      title,
      description,
      bullets,
      bulletPrefix = "•",
      variant = "bordered",
      padding = "md",
      footer,
      className,
      children,
      ...props
    },
    ref
  ) {
    const variantClasses = {
      bordered: "border-2 border-ink-800 rounded-[var(--radius-card)] shadow-[4px_4px_0_rgba(255,255,255,0.1)]",
      surface: "surface rounded-[var(--radius-card)]",
      ghost: "",
    };

    const paddingClasses = {
      sm: "p-spacing-4",
      md: "p-spacing-6",
      lg: "p-spacing-8",
    };

    return (
      <article
        ref={ref}
        className={clsx(
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {kicker && <Kicker className="mb-spacing-4">{kicker}</Kicker>}
        <H3 size="sm">{title}</H3>
        {description && (
          <Body size="sm" className="mt-spacing-2 text-ink-300">{description}</Body>
        )}
        {bullets && bullets.length > 0 && (
          <List className="mt-spacing-4 space-y-spacing-2 text-body-sm text-ink-200">
            {bullets.map((bullet) => (
              <ListItem key={bullet} className="flex gap-gap-xs">
                {typeof bulletPrefix === "string" ? (
                  <Text className="text-ink-500">{bulletPrefix}</Text>
                ) : (
                  bulletPrefix
                )}
                <Text>{bullet}</Text>
              </ListItem>
            ))}
          </List>
        )}
        {children}
        {footer && <div className="mt-spacing-4">{footer}</div>}
      </article>
    );
  }
);

export type FeatureCardProps = ContentCardProps & {
  /** Metrics to display */
  metrics?: Array<{ label: string; value: string | number }>;
};

/**
 * FeatureCard - Extended ContentCard with metrics display
 * Used for field insights, revenue panels, etc.
 */
export const FeatureCard = forwardRef<HTMLElement, FeatureCardProps>(
  function FeatureCard({ metrics, children, ...props }, ref) {
    return (
      <ContentCard ref={ref} {...props}>
        {metrics && metrics.length > 0 && (
          <Stack direction="horizontal" gap={6} className="mt-spacing-4">
            {metrics.map((metric) => (
              <Stack key={metric.label}>
                <Kicker size="sm" variant="muted">{metric.label}</Kicker>
                <Body className="font-display text-h3-md text-ink-50">{metric.value}</Body>
              </Stack>
            ))}
          </Stack>
        )}
        {children}
      </ContentCard>
    );
  }
);
