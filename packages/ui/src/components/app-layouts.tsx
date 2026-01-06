"use client";

import { ReactNode } from "react";
import { Box, Stack, Body, H2, Grid, AuthenticatedShell } from "@ghxstship/ui";
import type { SidebarSection } from "@ghxstship/ui";

interface AppLayoutConfig {
  appName: string;
  logo: ReactNode;
  sidebarNavigation: SidebarSection[];
  inverted?: boolean;
}

interface LoadingLayoutProps {
  text?: string;
  config: AppLayoutConfig;
}

interface EmptyLayoutProps {
  title: string;
  description?: string;
  action?: ReactNode;
  config: AppLayoutConfig;
}

interface SkeletonLayoutProps {
  config: AppLayoutConfig;
  showStats?: boolean;
  showTable?: boolean;
  showCards?: boolean;
  cardCount?: number;
}

/**
 * Shared Loading Layout Component
 * Eliminates duplication across all apps
 */
export function AppLoadingLayout({ text = "Loading...", config }: LoadingLayoutProps) {
  return (
    <AuthenticatedShell
      sections={config.sidebarNavigation}
      logo={config.logo}
    >
      <Box className="flex min-h-[60vh] items-center justify-center">
        <Box className="text-center">
          <Box className="animate-spin rounded-avatar h-8 w-8 border-b-2 border-border mx-auto mb-4" />
          <Body className="text-text-muted">{text}</Body>
        </Box>
      </Box>
    </AuthenticatedShell>
  );
}

/**
 * Shared Empty Layout Component
 * Eliminates duplication across all apps
 */
export function AppEmptyLayout({ title, description, action, config }: EmptyLayoutProps) {
  return (
    <AuthenticatedShell
      sections={config.sidebarNavigation}
      logo={config.logo}
    >
      <Box className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <H2 className="text-text-primary mb-4">{title}</H2>
        {description && <Body className="text-text-muted max-w-md mb-8">{description}</Body>}
        {action}
      </Box>
    </AuthenticatedShell>
  );
}

/**
 * Shared Skeleton Layout Component
 * Eliminates duplication across all apps
 */
export function AppSkeletonLayout({
  config,
  showStats = true,
  showTable = false,
  showCards = true,
  cardCount = 4,
}: SkeletonLayoutProps) {
  return (
    <AuthenticatedShell
      sections={config.sidebarNavigation}
      logo={config.logo}
    >
      <Stack gap={8}>
        {/* Header skeleton */}
        <Stack gap={2}>
          <Box className="h-8 w-64 animate-pulse rounded-card bg-muted" />
          <Box className="h-4 w-96 animate-pulse rounded-card bg-muted" />
          <Box className="h-4 w-80 animate-pulse rounded-card bg-muted" />
        </Stack>

        {/* Stats grid skeleton */}
        {showStats && (
          <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Box key={i} className="border-2 border-border bg-surface-inverse p-6 rounded-card">
                <Stack gap={2}>
                  <Box className="h-6 w-20 animate-pulse rounded-card bg-muted" />
                  <Box className="h-4 w-32 animate-pulse rounded-card bg-muted" />
                  <Box className="h-2 w-24 animate-pulse rounded-card bg-muted" />
                </Stack>
              </Box>
            ))}
          </Grid>
        )}

        {/* Table skeleton */}
        {showTable && (
          <Box className="border-2 border-border bg-surface-inverse p-6 rounded-card">
            <Stack gap={4}>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Box className="h-6 w-32 animate-pulse rounded-card bg-muted" />
                <Box className="h-10 w-32 animate-pulse rounded-card bg-muted" />
              </Stack>
              <Stack gap={2}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Box key={i} className="h-16 w-full animate-pulse rounded-card bg-muted" />
                ))}
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Content cards skeleton */}
        {showCards && (
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <Box key={i} className="border-2 border-border bg-surface-inverse p-6 rounded-card">
                <Stack gap={4}>
                  <Box className="h-4 w-24 animate-pulse rounded-card bg-muted" />
                  <Box className="h-6 w-32 animate-pulse rounded-card bg-muted" />
                  <Box className="h-2 w-full animate-pulse rounded-card bg-muted" />
                </Stack>
              </Box>
            ))}
          </Grid>
        )}
      </Stack>
    </AuthenticatedShell>
  );
}
