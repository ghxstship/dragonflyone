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
  Spinner,
  AuthenticatedShell,
  Link,
  CommandPalette,
  MobileBottomNav,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  Grid,
  Card,
  PageTransition,
Box} from "@ghxstship/ui";
import type { ContextLevel, Box} from "@ghxstship/ui";
import { useBaseAppLayout } from "@ghxstship/config/layouts";
import { atlvsLayoutConfig } from "../config/app-layout-config";

// =============================================================================
// ATLVS APP LAYOUT V2 - Using BaseAppLayout Hook
// Bold Contemporary Pop Art Adventure Design System - Dark Theme (B2B)
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  variant?: "public" | "authenticated";
  contextLevels?: ContextLevel[];
  userMenu?: ReactNode;
  showFooter?: boolean;
  background?: "black" | "white";
  className?: string;
  rawContent?: boolean;
}

/**
 * AtlvsAppLayoutV2 - Refactored layout using shared BaseAppLayout hook
 */
export function AtlvsAppLayoutV2({
  children,
  variant = "authenticated",
  contextLevels = [],
  userMenu,
  showFooter,
  background = "black",
  className,
  rawContent = false,
}: AppLayoutProps) {
  const {
    router,
    pathname,
    handleContextNavigation,
    user,
    userRoles,
    recentPages,
    favorites,
    productionId,
    isProductionContext,
    getContextualNavigation,
    mobileNavItems,
    quickActions,
    commandPaletteOpen,
    closeCommandPalette,
    commandCategories,
    recentItems,
    handleCommandSelect,
    contextBreadcrumbs,
    buildBreadcrumbContext,
    contextOptions,
    handleContextSwitch,
    handleSignOut,
  } = useBaseAppLayout(atlvsLayoutConfig, {
    children,
    variant,
    contextLevels,
    userMenu,
    showFooter,
    background,
    className,
    rawContent,
  });

  // Demo notifications
  const notifications = atlvsLayoutConfig.notifications || [];

  // For authenticated pages, use the sidebar shell
  if (variant === "authenticated") {
    const finalBreadcrumbs = contextBreadcrumbs.length > 0 
      ? contextBreadcrumbs 
      : buildBreadcrumbContext();

    return (
      <>
        <AuthenticatedShell
          navigation={getContextualNavigation()}
          currentPath={pathname}
          logo={
            <Link href="/dashboard" className="font-display text-h5-md uppercase text-white transition-colors hover:text-on-dark-secondary">
              ATLVS
            </Link>
          }
          breadcrumbContext={finalBreadcrumbs}
          contextOptions={contextOptions}
          onContextSwitch={handleContextSwitch}
          user={user ? {
            name: user.name || "User",
            email: user.email,
            avatar: user.avatar,
          } : {
            name: "Demo User",
            email: "demo@ghxstship.com",
          }}
          quickActions={quickActions}
          favorites={favorites}
          recentPages={recentPages}
          userRoles={userRoles}
          storageKey="atlvs-sidebar"
          inverted={background === "black"}
          onNavigate={handleContextNavigation}
          settingsPath={isProductionContext ? `/p/${productionId}/settings` : "/settings"}
          notifications={notifications}
          onSignOut={handleSignOut}
          className={className}
          headerActions={userMenu}
        >
          <Box className="p-6 lg:p-8 pb-20 md:pb-8">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Box>
        </AuthenticatedShell>
        
        <MobileBottomNav
          items={mobileNavItems}
          currentPath={pathname}
          onNavigate={handleContextNavigation}
          inverted={background === "black"}
        />
        
        <CommandPalette
          open={commandPaletteOpen}
          onClose={closeCommandPalette}
          categories={commandCategories}
          recentItems={recentItems}
          onSelect={handleCommandSelect}
          onNavigate={(href) => router.push(href)}
          placeholder="Search commands, pages, or actions..."
          inverted={background === "black"}
        />
      </>
    );
  }

  // For public pages, use the traditional layout
  const isDark = background === "black";
  const shouldShowFooter = showFooter ?? true;
  const { footerColumns, PublicNavigation } = atlvsLayoutConfig;

  return (
    <PageLayout
      background={background}
      header={<PublicNavigation />}
      footer={
        shouldShowFooter ? (
          <Footer
            logo={<Display size="md">ATLVS</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} title={column.title}>
                {column.links.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </FooterColumn>
            ))}
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
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Container>
        </FullBleedSection>
      )}
    </PageLayout>
  );
}

/**
 * AtlvsLoadingLayoutV2 - Loading state wrapper
 */
export function AtlvsLoadingLayoutV2({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <AtlvsAppLayoutV2 variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text={text} />
      </Stack>
    </AtlvsAppLayoutV2>
  );
}

/**
 * AtlvsEmptyLayoutV2 - Empty state wrapper
 */
export function AtlvsEmptyLayoutV2({
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
    <AtlvsAppLayoutV2 variant={variant}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className="text-white">{title}</Display>
        {description && <Label size="sm" className="text-on-dark-muted max-w-md">{description}</Label>}
        {action}
      </Stack>
    </AtlvsAppLayoutV2>
  );
}

/**
 * AtlvsSkeletonLayoutV2 - Skeleton loading state
 */
export function AtlvsSkeletonLayoutV2({
  variant = "authenticated",
  showStats = true,
  showTable = false,
  showCards = true,
  cardCount = 4,
}: {
  variant?: AppLayoutProps["variant"];
  showStats?: boolean;
  showTable?: boolean;
  showCards?: boolean;
  cardCount?: number;
}) {
  return (
    <AtlvsAppLayoutV2 variant={variant}>
      <Stack gap={8}>
        <Stack gap={2}>
          <Skeleton width="120px" height="1rem" />
          <Skeleton width="280px" height="2.5rem" />
          <Skeleton width="200px" height="1rem" />
        </Stack>

        {showStats && (
          <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} inverted className="p-6">
                <Stack gap={2}>
                  <Skeleton width="60%" height="1rem" />
                  <Skeleton width="40%" height="2rem" />
                  <Skeleton width="30%" height="0.75rem" />
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {showTable && <SkeletonTable rows={5} />}

        {showCards && (
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Grid>
        )}
      </Stack>
    </AtlvsAppLayoutV2>
  );
}
