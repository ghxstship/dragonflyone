"use client";

import { ReactNode } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
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
  ContextSwitcher,
} from "@ghxstship/ui";
import {
  CreatorNavigationPublic,
} from "./navigation";
import { 
  atlvsSidebarNavigation, 
  atlvsProductionNavigation,
  atlvsQuickActions,
  atlvsDemoProductions,
  type ProductionContext,
} from "../data/atlvs";
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
  /** If true, children are rendered directly without wrapper (for landing pages with custom sections) */
  rawContent?: boolean;
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
  rawContent = false,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  // Determine if we're in production context
  const productionId = params?.productionId as string | undefined;
  const isProductionContext = Boolean(productionId);
  
  // Find current production
  const currentProduction = isProductionContext
    ? atlvsDemoProductions.find((p) => p.id === productionId)
    : undefined;

  // Get appropriate navigation based on context
  const navigation = isProductionContext
    ? atlvsProductionNavigation
    : atlvsSidebarNavigation;

  // Prefix hrefs with production context if needed
  const getContextualNavigation = () => {
    if (!isProductionContext || !productionId) {
      return navigation as SidebarNavSection[];
    }
    
    // Add /p/[productionId] prefix to all hrefs in production navigation
    return (navigation as SidebarNavSection[]).map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        href: item.href ? `/p/${productionId}${item.href}` : item.href,
      })),
      subsections: section.subsections?.map((subsection) => ({
        ...subsection,
        items: subsection.items.map((item) => ({
          ...item,
          href: item.href ? `/p/${productionId}${item.href}` : item.href,
        })),
      })),
    }));
  };

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
    void workspaceId; // Suppress unused variable warning
    router.push("/dashboard");
  };

  // Handle production selection
  const handleSelectProduction = (production: ProductionContext) => {
    router.push(`/p/${production.id}/overview`);
  };

  // Handle exit production
  const handleExitProduction = () => {
    router.push("/dashboard");
  };

  // Handle create production
  const handleCreateProduction = () => {
    router.push("/projects/new");
  };

  // For authenticated pages, use the new sidebar shell
  if (variant === "authenticated") {
    return (
      <AuthenticatedShell
        navigation={getContextualNavigation()}
        currentPath={pathname}
        logo={
          <Link href="/dashboard" className="font-display text-h5-md uppercase text-white transition-colors hover:text-grey-200">
            ATLVS
          </Link>
        }
        workspaceName={currentProduction?.name || "GHXSTSHIP"}
        user={{
          name: "Demo User",
          email: "demo@ghxstship.com",
        }}
        quickActions={atlvsQuickActions.slice(0, 3)}
        inverted={background === "black"}
        onNavigate={(href: string) => router.push(href)}
        settingsPath={isProductionContext ? `/p/${productionId}/settings` : "/settings"}
        notifications={demoNotifications}
        workspaces={demoWorkspaces}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        onSignOut={handleSignOut}
        className={className}
        headerActions={
          <ContextSwitcher
            contextLevel={isProductionContext ? "production" : "platform"}
            currentProduction={currentProduction}
            productions={atlvsDemoProductions}
            onSelectProduction={handleSelectProduction}
            onExitProduction={handleExitProduction}
            onCreateProduction={handleCreateProduction}
            inverted={background === "black"}
          />
        }
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
      {rawContent ? (
        children
      ) : (
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
      )}
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
