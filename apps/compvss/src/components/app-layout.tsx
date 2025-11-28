"use client";

import { ReactNode } from "react";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  FullBleedSection,
  Container,
  Stack,
  Label,
  LoadingSpinner,
} from "@ghxstship/ui";
import {
  CreatorNavigationPublic,
  CreatorNavigationAuthenticated,
} from "./navigation";
import type { ContextLevel } from "@ghxstship/ui";

// =============================================================================
// COMPVSS APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Light/Dark Theme
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: ContextLevel[];
  /** Custom user menu for authenticated navigation */
  userMenu?: ReactNode;
  /** Show footer (default: true) */
  showFooter?: boolean;
  /** Background color */
  background?: "black" | "white";
  /** Additional className for the main section */
  className?: string;
}

/**
 * CompvssAppLayout - Unified layout wrapper for all COMPVSS pages
 * Provides consistent header, footer, and styling across the app
 */
export function CompvssAppLayout({
  children,
  variant = "authenticated",
  contextLevels = [],
  userMenu,
  showFooter = true,
  background = "white",
  className,
}: AppLayoutProps) {
  const getNavigation = () => {
    switch (variant) {
      case "public":
        return <CreatorNavigationPublic />;
      case "authenticated":
        return <CreatorNavigationAuthenticated contextLevels={contextLevels} userMenu={userMenu} />;
      default:
        return <CreatorNavigationAuthenticated contextLevels={contextLevels} userMenu={userMenu} />;
    }
  };

  const isDark = background === "black";

  return (
    <PageLayout
      background={background}
      header={getNavigation()}
      footer={
        showFooter ? (
          <Footer
            logo={<Display size="md">COMPVSS</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            <FooterColumn title="Operations">
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/projects">Projects</FooterLink>
              <FooterLink href="/crew">Crew</FooterLink>
            </FooterColumn>
            <FooterColumn title="Resources">
              <FooterLink href="/equipment">Equipment</FooterLink>
              <FooterLink href="/schedule">Schedule</FooterLink>
              <FooterLink href="/directory">Directory</FooterLink>
            </FooterColumn>
            <FooterColumn title="Support">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/help#contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        ) : undefined
      }
    >
      <FullBleedSection
        background={isDark ? "ink" : "white"}
        pattern="grid"
        patternOpacity={isDark ? 0.03 : 0.04}
        className={`min-h-screen ${className || ""}`}
      >
        <Container className="py-8 sm:py-12 md:py-16">
          {children}
        </Container>
      </FullBleedSection>
    </PageLayout>
  );
}

/**
 * CompvssLoadingLayout - Loading state wrapper
 */
export function CompvssLoadingLayout({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <CompvssAppLayout variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
      </Stack>
    </CompvssAppLayout>
  );
}

/**
 * CompvssEmptyLayout - Empty state wrapper
 */
export function CompvssEmptyLayout({
  title,
  description,
  action,
  variant = "authenticated",
  background = "white",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
  background?: "black" | "white";
}) {
  const isDark = background === "black";
  
  return (
    <CompvssAppLayout variant={variant} background={background}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className={isDark ? "text-white" : "text-black"}>{title}</Display>
        {description && <Label size="sm" className={isDark ? "text-on-dark-muted" : "text-muted"} style={{ maxWidth: "28rem" }}>{description}</Label>}
        {action}
      </Stack>
    </CompvssAppLayout>
  );
}
