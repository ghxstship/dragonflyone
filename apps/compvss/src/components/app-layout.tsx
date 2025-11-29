"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  AuthenticatedShell,
  Link,
} from "@ghxstship/ui";
import {
  CreatorNavigationPublic,
} from "./navigation";
import { compvssSidebarNavigation, compvssQuickActions } from "../data/compvss";
import type { ContextLevel, SidebarNavSection } from "@ghxstship/ui";

// =============================================================================
// COMPVSS APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Light/Dark Theme
// ClickUp-style sidebar navigation for production management
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: ContextLevel[];
  /** Custom user menu for authenticated navigation */
  userMenu?: ReactNode;
  /** Show footer (default: true for public, false for authenticated) */
  showFooter?: boolean;
  /** Background color */
  background?: "black" | "white";
  /** Additional className for the main section */
  className?: string;
}

/**
 * CompvssAppLayout - Unified layout wrapper for all COMPVSS pages
 * Uses ClickUp-style sidebar for authenticated pages
 * Uses traditional header/footer for public pages
 */
export function CompvssAppLayout({
  children,
  variant = "authenticated",
  contextLevels: _contextLevels = [],
  userMenu: _userMenu,
  showFooter,
  background = "white",
  className,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // For authenticated pages, use the new sidebar shell
  if (variant === "authenticated") {
    // COMPVSS uses light theme by default (production crews prefer light mode)
    const inverted = background === "black";
    
    return (
      <AuthenticatedShell
        navigation={compvssSidebarNavigation as SidebarNavSection[]}
        currentPath={pathname}
        logo={
          <Link href="/dashboard" className={`font-display text-h5-md uppercase ${inverted ? "text-white hover:text-grey-200" : "text-black hover:text-grey-700"} transition-colors`}>
            COMPVSS
          </Link>
        }
        workspaceName="PRODUCTION"
        user={{
          name: "Crew Lead",
          email: "crew@ghxstship.com",
        }}
        quickActions={compvssQuickActions.slice(0, 3)}
        inverted={inverted}
        onNavigate={(href: string) => router.push(href)}
        className={className}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </AuthenticatedShell>
    );
  }

  // For public pages, use the traditional layout with header/footer
  const isDark = background === "black";
  const shouldShowFooter = showFooter ?? true;

  return (
    <PageLayout
      background={background}
      header={<CreatorNavigationPublic />}
      footer={
        shouldShowFooter ? (
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
