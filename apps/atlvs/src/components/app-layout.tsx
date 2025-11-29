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
import { atlvsSidebarNavigation, atlvsQuickActions } from "../data/atlvs";
import type { ContextLevel, SidebarNavSection } from "@ghxstship/ui";

// =============================================================================
// ATLVS APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Dark Theme (B2B)
// ClickUp-style sidebar navigation for enterprise dashboard
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
 * AtlvsAppLayout - Unified layout wrapper for all ATLVS pages
 * Uses ClickUp-style sidebar for authenticated pages
 * Uses traditional header/footer for public pages
 */
export function AtlvsAppLayout({
  children,
  variant = "authenticated",
  contextLevels: _contextLevels = [],
  userMenu: _userMenu,
  showFooter,
  background = "black",
  className,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Demo notifications for header
  const demoNotifications = [
    { id: "1", title: "New project created", message: "Project 'Summer Campaign' was created", time: "2 min ago", read: false },
    { id: "2", title: "Budget approved", message: "Q4 budget has been approved by finance", time: "1 hour ago", read: false },
    { id: "3", title: "Team member added", message: "Sarah joined the Marketing team", time: "3 hours ago", read: true },
  ];

  // Demo workspaces for header
  const demoWorkspaces = [
    { id: "ghxstship", name: "GHXSTSHIP", current: true },
    { id: "acme", name: "ACME Corp", current: false },
    { id: "personal", name: "Personal", current: false },
  ];

  // Handle sign out
  const handleSignOut = () => {
    router.push("/auth/signin");
  };

  // Handle workspace switch
  const handleWorkspaceSwitch = (workspaceId: string) => {
    // In a real app, this would switch the workspace context
    console.log("Switching to workspace:", workspaceId);
    router.push("/dashboard");
  };

  // For authenticated pages, use the new sidebar shell
  if (variant === "authenticated") {
    return (
      <AuthenticatedShell
        navigation={atlvsSidebarNavigation as SidebarNavSection[]}
        currentPath={pathname}
        logo={
          <Link href="/dashboard" className="font-display text-h5-md uppercase text-white transition-colors hover:text-grey-200">
            ATLVS
          </Link>
        }
        workspaceName="GHXSTSHIP"
        user={{
          name: "Demo User",
          email: "demo@ghxstship.com",
        }}
        quickActions={atlvsQuickActions.slice(0, 3)}
        inverted={background === "black"}
        onNavigate={(href: string) => router.push(href)}
        settingsPath="/settings"
        notifications={demoNotifications}
        workspaces={demoWorkspaces}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        onSignOut={handleSignOut}
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
            logo={<Display size="md">ATLVS</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            <FooterColumn title="Platform">
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/projects">Projects</FooterLink>
              <FooterLink href="/finance">Finance</FooterLink>
            </FooterColumn>
            <FooterColumn title="Resources">
              <FooterLink href="/assets">Assets</FooterLink>
              <FooterLink href="/vendors">Vendors</FooterLink>
              <FooterLink href="/reports">Reports</FooterLink>
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
 * AtlvsLoadingLayout - Loading state wrapper
 */
export function AtlvsLoadingLayout({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <AtlvsAppLayout variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
      </Stack>
    </AtlvsAppLayout>
  );
}

/**
 * AtlvsEmptyLayout - Empty state wrapper
 */
export function AtlvsEmptyLayout({
  title,
  description,
  action,
  variant = "authenticated",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <AtlvsAppLayout variant={variant}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className="text-white">{title}</Display>
        {description && <Label size="sm" className="text-on-dark-muted max-w-md">{description}</Label>}
        {action}
      </Stack>
    </AtlvsAppLayout>
  );
}
