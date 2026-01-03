"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Stack, Grid } from "../foundations/layout.js";
import { Box } from "../foundations/semantic.js";
import { MarketingPageHeader } from "../foundations/page-regions.js";
import { StatCard } from "../molecules/stat-card.js";
import { Button } from "../atoms/button.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { AlertTriangle, WifiOff } from "lucide-react";

// =============================================================================
// HUB PAGE
// Feature hub layout with stats, tabs, and sidebar
// Ideal for Community, Training, Webinars, and similar feature areas
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface HubPageTab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface HubPageStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface HubPageProps {
  /** Page header configuration */
  header: {
    kicker?: string;
    title: string;
    description?: string;
  };
  /** Primary action buttons */
  actions?: ReactNode;
  /** Stats row displayed below header */
  stats?: HubPageStat[];
  /** Tab configuration for content switching */
  tabs?: HubPageTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Sidebar position */
  sidebarPosition?: "left" | "right";
  /** Sidebar width (in 12-column grid units) */
  sidebarWidth?: 3 | 4;
  /** Main content */
  children: ReactNode;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Offline state */
  offline?: boolean;
}

/**
 * HubPage - Feature hub layout with stats, tabs, and sidebar
 * 
 * Use cases:
 * - Community forums
 * - Training/learning centers
 * - Webinar hubs
 * - Resource libraries
 * - Knowledge bases
 * 
 * Features:
 * - Header with kicker/title/description/actions
 * - Stats row for key metrics
 * - Tab-based content switching
 * - Two-column layout with sidebar
 * - Loading, error, offline state variants
 * - Bold Contemporary Pop Art Adventure styling
 */
export const HubPage = forwardRef<HTMLDivElement, HubPageProps>(
  function HubPage(
    {
      header,
      actions,
      stats,
      tabs,
      activeTab,
      onTabChange,
      sidebar,
      sidebarPosition = "right",
      sidebarWidth = 4,
      children,
      inverted = true,
      className,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
    },
    ref
  ) {
    
    // Loading state
    if (loading) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-[60vh] flex items-center justify-center",
            inverted ? "bg-black" : "bg-white",
            className
          )}
        >
          <Stack gap={4} className="items-center text-center">
            <Spinner size="lg" variant={inverted ? "white" : "grey"} />
            <Body className={inverted ? "text-on-dark-secondary" : "text-on-light-secondary"}>
              {loadingMessage}
            </Body>
          </Stack>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-[60vh] flex items-center justify-center",
            inverted ? "bg-black" : "bg-white",
            className
          )}
        >
          <Stack gap={4} className="items-center text-center max-w-md">
            <Box className="p-4 rounded-card bg-error/20">
              <AlertTriangle className="size-12 text-error" />
            </Box>
            <H2 className={inverted ? "text-white" : "text-black"}>
              Something went wrong
            </H2>
            <Body className={inverted ? "text-on-dark-secondary" : "text-on-light-secondary"}>
              {error.message || "An unexpected error occurred. Please try again."}
            </Body>
            {onRetry && (
              <Button variant="solid" onClick={onRetry}>
                Try Again
              </Button>
            )}
          </Stack>
        </div>
      );
    }

    // Offline state
    if (offline) {
      return (
        <div
          ref={ref}
          className={clsx(
            "min-h-[60vh] flex items-center justify-center",
            inverted ? "bg-black" : "bg-white",
            className
          )}
        >
          <Stack gap={4} className="items-center text-center max-w-md">
            <Box className="p-4 rounded-card bg-warning/20">
              <WifiOff className="size-12 text-warning" />
            </Box>
            <H2 className={inverted ? "text-white" : "text-black"}>
              You&apos;re offline
            </H2>
            <Body className={inverted ? "text-on-dark-secondary" : "text-on-light-secondary"}>
              Please check your internet connection and try again.
            </Body>
          </Stack>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          "min-h-full",
          inverted ? "bg-black text-white" : "bg-white text-black",
          className
        )}
      >
        {/* Header */}
        <MarketingPageHeader
          kicker={header.kicker}
          title={header.title}
          description={header.description}
          actions={actions}
          align="left"
          inverted={inverted}
          className="mb-8"
        />

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <Grid 
            cols={Math.min(stats.length, 4) as 2 | 3 | 4} 
            gap={4} 
            className={clsx(
              "mb-8",
              stats.length === 2 && "grid-cols-2",
              stats.length === 3 && "grid-cols-1 sm:grid-cols-3",
              stats.length === 4 && "grid-cols-2 lg:grid-cols-4",
              stats.length >= 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            )}
          >
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                label={stat.label}
                value={stat.value}
                trend={stat.trend}
                trendValue={stat.trendValue}
                inverted={inverted}
              />
            ))}
          </Grid>
        )}

        {/* Main Content Area */}
        <Grid cols={12} gap={6} className="grid-cols-1 lg:grid-cols-12">
          {/* Sidebar (left position) */}
          {sidebar && sidebarPosition === "left" && (
            <Box className={clsx(
              sidebarWidth === 3 && "lg:col-span-3",
              sidebarWidth === 4 && "lg:col-span-4"
            )}>
              {sidebar}
            </Box>
          )}

          {/* Main Content */}
          <Box className={clsx(
            !sidebar && "lg:col-span-12",
            sidebar && sidebarWidth === 3 && "lg:col-span-9",
            sidebar && sidebarWidth === 4 && "lg:col-span-8"
          )}>
            {/* Tabs */}
            {tabs && tabs.length > 0 && (
              <Box className="flex items-center gap-2 mb-6 border-b-2 border-border pb-4 flex-wrap">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "solid" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange?.(tab.id)}
                    className="gap-2"
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span 
                        className={clsx(
                          "px-1.5 py-0.5 text-xs rounded-badge font-mono",
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : inverted
                              ? "bg-surface-elevated text-on-dark-muted"
                              : "bg-muted text-on-light-muted"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </Button>
                ))}
              </Box>
            )}

            {/* Content */}
            {children}
          </Box>

          {/* Sidebar (right position) */}
          {sidebar && sidebarPosition === "right" && (
            <Box className={clsx(
              sidebarWidth === 3 && "lg:col-span-3",
              sidebarWidth === 4 && "lg:col-span-4"
            )}>
              {sidebar}
            </Box>
          )}
        </Grid>
      </div>
    );
  }
);

export default HubPage;
