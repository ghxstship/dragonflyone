"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Container, Stack, Grid, Section } from "../foundations/layout.js";
import { PageHeader as EnterprisePageHeader } from "../organisms/page-header.js";
import { SectionHeader } from "../molecules/section-header.js";
import { Card } from "../molecules/card.js";
import { Body, Label } from "../atoms/typography.js";
import { Link } from "../atoms/link.js";
import { ChevronRight } from "lucide-react";

export interface SettingsCategory {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  href: string;
  badge?: string;
  disabled?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  categories: SettingsCategory[];
}

export interface SettingsHubPageProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Settings sections with categories */
  sections: SettingsSection[];
  /** Header actions */
  headerActions?: ReactNode;
  /** Secondary header actions */
  secondaryActions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  /** Show favorites toggle */
  showFavorite?: boolean;
  /** Show settings icon */
  showSettings?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
}

/**
 * SettingsHubPage template - Bold Contemporary Pop Art Adventure
 * 
 * A hub-style settings page with categorized navigation cards.
 * 
 * Features:
 * - EnterprisePageHeader integration
 * - Sectioned layout with SectionHeader
 * - Card-based category navigation
 * - Icon support for visual hierarchy
 * - Disabled state for unavailable settings
 * - Dark-first design
 */
export const SettingsHubPage = forwardRef<HTMLDivElement, SettingsHubPageProps>(
  function SettingsHubPage(
    {
      title = "Settings",
      subtitle = "Manage your account preferences and configuration",
      sections,
      headerActions,
      secondaryActions,
      showFavorite = false,
      showSettings = false,
      inverted = true,
      className,
      onNavigate,
    },
    ref
  ) {
    const bgClass = inverted ? "bg-ink-950" : "bg-white";

    const handleCategoryClick = (category: SettingsCategory) => {
      if (category.disabled) return;
      if (onNavigate) {
        onNavigate(category.href);
      }
    };

    return (
      <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
        <EnterprisePageHeader
          title={title}
          subtitle={subtitle}
          secondaryActions={secondaryActions}
          showFavorite={showFavorite}
          showSettings={showSettings}
          rightContent={headerActions}
          inverted={inverted}
        />

        <Container className="py-6 md:py-8">
          <Stack gap={10}>
            {sections.map((section) => (
              <Section key={section.id} border={false} background="transparent">
                <SectionHeader
                  title={section.title}
                  description={section.description}
                />
                <Grid
                  cols={3}
                  gap={4}
                  className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                >
                  {section.categories.map((category) => (
                    <SettingsCategoryCard
                      key={category.id}
                      category={category}
                      inverted={inverted}
                      onClick={() => handleCategoryClick(category)}
                    />
                  ))}
                </Grid>
              </Section>
            ))}
          </Stack>
        </Container>
      </div>
    );
  }
);

interface SettingsCategoryCardProps {
  category: SettingsCategory;
  inverted: boolean;
  onClick: () => void;
}

function SettingsCategoryCard({
  category,
  inverted,
  onClick,
}: SettingsCategoryCardProps) {
  const content = (
    <Card
      inverted={inverted}
      interactive={!category.disabled}
      className={clsx(
        "p-6 transition-all duration-200",
        category.disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={category.disabled ? undefined : onClick}
      onKeyDown={
        category.disabled
          ? undefined
          : (e) => e.key === "Enter" && onClick()
      }
      role="button"
      tabIndex={category.disabled ? -1 : 0}
      aria-disabled={category.disabled}
      aria-label={`${category.title}${category.description ? `: ${category.description}` : ""}`}
    >
      <Stack direction="horizontal" className="items-start justify-between">
        <Stack direction="horizontal" gap={4} className="items-start">
          {category.icon && (
            <div
              className={clsx(
                "shrink-0 rounded-card p-3",
                inverted ? "bg-ink-800" : "bg-grey-100"
              )}
            >
              <div
                className={clsx(
                  "size-6",
                  inverted ? "text-grey-300" : "text-grey-600"
                )}
              >
                {category.icon}
              </div>
            </div>
          )}
          <Stack gap={1}>
            <Stack direction="horizontal" gap={2} className="items-center">
              <Body
                className={clsx(
                  "font-display font-semibold",
                  inverted ? "text-white" : "text-ink-900"
                )}
              >
                {category.title}
              </Body>
              {category.badge && (
                <span
                  className={clsx(
                    "rounded-badge px-2 py-0.5 text-xs font-medium uppercase",
                    inverted
                      ? "bg-primary text-white"
                      : "bg-primary-100 text-primary"
                  )}
                >
                  {category.badge}
                </span>
              )}
            </Stack>
            {category.description && (
              <Label
                size="sm"
                className={inverted ? "text-on-dark-muted" : "text-grey-500"}
              >
                {category.description}
              </Label>
            )}
          </Stack>
        </Stack>
        {!category.disabled && (
          <ChevronRight
            className={clsx(
              "size-5 shrink-0",
              inverted ? "text-grey-500" : "text-grey-400"
            )}
          />
        )}
      </Stack>
    </Card>
  );

  if (category.disabled) {
    return content;
  }

  return (
    <Link href={category.href} className="block no-underline">
      {content}
    </Link>
  );
}

/**
 * SettingsPageLayout - Wrapper for individual settings pages
 * Provides consistent layout for settings sub-pages
 */
export interface SettingsPageLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Header actions */
  headerActions?: ReactNode;
  /** Secondary header actions */
  secondaryActions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  /** Page content */
  children: ReactNode;
  /** Maximum content width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  full: "max-w-full",
};

export const SettingsPageLayout = forwardRef<
  HTMLDivElement,
  SettingsPageLayoutProps
>(function SettingsPageLayout(
  {
    title,
    description,
    headerActions,
    secondaryActions,
    children,
    maxWidth = "lg",
    inverted = true,
    className,
  },
  ref
) {
  const bgClass = inverted ? "bg-ink-950" : "bg-white";

  return (
    <div ref={ref} className={clsx("min-h-screen", bgClass, className)}>
      <EnterprisePageHeader
        title={title}
        subtitle={description}
        secondaryActions={secondaryActions}
        rightContent={headerActions}
        inverted={inverted}
      />

      <Container className="py-6 md:py-8">
        <div className={maxWidthClasses[maxWidth]}>{children}</div>
      </Container>
    </div>
  );
});
