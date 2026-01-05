"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { detailPageVariants } from "./DetailPage.variants.js";
import type { DetailPageProps } from "./DetailPage.types.js";
import type { ReactNode } from "react";
import { Container, Stack } from "../../foundations/layout.js";
import { MarketingPageHeader, SplitLayout } from "../../foundations/page-regions.js";
import { Tabs, TabsList, TabsTrigger, TabsPanel } from "../../molecules/Tabs/index.js";
import { Button } from "../../atoms/Button/index.js";
import { Link } from "../../atoms/Link/index.js";
import { Spinner } from '../../atoms/Spinner/index.js';
import { Body, H2 } from '../../atoms/Typography/index.js';
import { AlertTriangle, WifiOff, ShieldX, ChevronLeft, FileQuestion } from "lucide-react";

/**
 * DetailPage - Entity/record detail view with tabs and sidebar
 * 
 * Features:
 * - Entity detail view with optional tabbed content
 * - Optional sidebar for metadata/actions
 * - Integrated page header with back navigation
 * - Loading, error, not found, offline, restricted state variants
 * - Controlled or uncontrolled tab state
 * - Skip to main content accessibility link
 * - Keyboard navigation support
 * - Dark-first design
 * 
 * Use cases:
 * - User profile pages
 * - Product detail pages
 * - Order detail pages
 * - Any entity view with multiple sections
 */
export const DetailPage = forwardRef<HTMLDivElement, DetailPageProps>(
  function DetailPage(
    {
      navigation,
      header,
      actions,
      backButton,
      children,
      tabs,
      defaultTabIndex = 0,
      activeTabIndex: controlledTabIndex,
      onTabChange,
      sidebar,
      sidebarPosition = "right",
      sidebarWidth = 4,
      stickySidebar = true,
      inverted = true,
      className,
      loading = false,
      loadingMessage = "Loading details...",
      error = null,
      onRetry,
      notFound = false,
      notFoundMessage = "The item you're looking for doesn't exist or has been removed.",
      notFoundAction,
      offline = false,
      restricted = false,
      restrictedMessage = "You don't have permission to view this item",
      restrictedAction,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const [internalTabIndex, setInternalTabIndex] = useState(defaultTabIndex);
    
    // Use controlled or uncontrolled tab state
    const activeTab = controlledTabIndex ?? internalTabIndex;
    const setActiveTab = useCallback((index: number) => {
      if (onTabChange) {
        onTabChange(index);
      } else {
        setInternalTabIndex(index);
      }
    }, [onTabChange]);

    const _bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";

    // Render state content
    const renderStateContent = (
      icon: ReactNode,
      title: string,
      message: string,
      action?: ReactNode
    ) => (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <Stack gap={6} className="items-center text-center max-w-md">
          {icon}
          <Stack gap={2} className="items-center">
            <H2 className={inverted ? "text-text-primary" : "text-text-primary"}>{title}</H2>
            <Body className={inverted ? "text-text-muted" : "text-text-muted"}>{message}</Body>
          </Stack>
          {action}
        </Stack>
      </div>
    );

    // Loading state
    if (loading) {
      return (
        <div ref={ref} className={clsx(detailPageVariants({ inverted, loading: true }), className)}>
          <a
            href={`#${mainContentId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {skipToMainLabel}
          </a>
          {navigation}
          <main id={mainContentId} tabIndex={-1} role="main">
            <Container className="py-6 md:py-8">
              {backButton && (
                <div className="mb-6">
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={backButton.onClick}>
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}
              {renderStateContent(
                <Spinner size="lg" />,
                "Loading",
                loadingMessage
              )}
            </Container>
          </main>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={clsx(detailPageVariants({ inverted, error: true }), className)}>
          <a
            href={`#${mainContentId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {skipToMainLabel}
          </a>
          {navigation}
          <main id={mainContentId} tabIndex={-1} role="main">
            <Container className="py-6 md:py-8">
              {backButton && (
                <div className="mb-6">
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={backButton.onClick}>
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}
              {renderStateContent(
                <AlertTriangle className="size-16 text-error animate-shake" />,
                "Something Went Wrong",
                error.message || "An unexpected error occurred",
                onRetry && (
                  <Button variant="solid" onClick={onRetry}>
                    Try Again
                  </Button>
                )
              )}
            </Container>
          </main>
        </div>
      );
    }

    // Not found state
    if (notFound) {
      return (
        <div ref={ref} className={clsx(detailPageVariants({ inverted, notFound }), className)}>
          <a
            href={`#${mainContentId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {skipToMainLabel}
          </a>
          {navigation}
          <main id={mainContentId} tabIndex={-1} role="main">
            <Container className="py-6 md:py-8">
              {backButton && (
                <div className="mb-6">
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={backButton.onClick}>
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}
              {renderStateContent(
                <FileQuestion className="size-16 text-text-disabled" />,
                "Not Found",
                notFoundMessage,
                notFoundAction && (
                  <Button variant="solid" onClick={notFoundAction.onClick}>
                    {notFoundAction.label}
                  </Button>
                )
              )}
            </Container>
          </main>
        </div>
      );
    }

    // Offline state
    if (offline) {
      return (
        <div ref={ref} className={clsx(detailPageVariants({ inverted, offline }), className)}>
          <a
            href={`#${mainContentId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {skipToMainLabel}
          </a>
          {navigation}
          <main id={mainContentId} tabIndex={-1} role="main">
            <Container className="py-6 md:py-8">
              {backButton && (
                <div className="mb-6">
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={backButton.onClick}>
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}
              {renderStateContent(
                <WifiOff className="size-16 text-warning" />,
                "You're Offline",
                "Please check your internet connection and try again.",
                <Button variant="solid" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              )}
            </Container>
          </main>
        </div>
      );
    }

    // Restricted state
    if (restricted) {
      return (
        <div ref={ref} className={clsx(detailPageVariants({ inverted, restricted }), className)}>
          <a
            href={`#${mainContentId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {skipToMainLabel}
          </a>
          {navigation}
          <main id={mainContentId} tabIndex={-1} role="main">
            <Container className="py-6 md:py-8">
              {backButton && (
                <div className="mb-6">
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button variant="ghost" size="sm" inverted={inverted} onClick={backButton.onClick}>
                      <ChevronLeft className="size-4" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}
              {renderStateContent(
                <ShieldX className="size-16 text-error" />,
                "Access Denied",
                restrictedMessage,
                restrictedAction && (
                  <Button variant="solid" onClick={restrictedAction.onClick}>
                    {restrictedAction.label}
                  </Button>
                )
              )}
            </Container>
          </main>
        </div>
      );
    }

    // Main content with tabs
    const mainContent = tabs ? (
      <Tabs inverted={inverted}>
        <Tabs inverted={inverted} defaultValue={tabs[0]?.id}>
          <TabsList inverted={inverted} className="mb-6">
            {tabs.map((tab, _index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                inverted={inverted}
                onClick={() => !tab.disabled && setActiveTab(_index)}
                aria-selected={activeTab === _index}
                role="tab"
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className={clsx(
                      "px-1.5 py-0.5 text-xs rounded-badge font-medium",
                      inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-disabled"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        {tabs.map((tab, _index) => (
          <TabsPanel
            key={tab.id}
            value={tab.id}
            inverted={inverted}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
          >
            {tab.content}
          </TabsPanel>
        ))}
        </Tabs>
      </Tabs>
    ) : (
      children
    );

    // Sidebar wrapper
    const sidebarContent = sidebar && (
      <div className={clsx(stickySidebar && "sticky top-6")}>
        {sidebar}
      </div>
    );

    return (
      <div ref={ref} className={clsx(detailPageVariants({ inverted }), className)}>
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {navigation}

        <main id={mainContentId} tabIndex={-1} role="main" aria-label="Detail content">
          <Container className="py-6 md:py-8">
            <Stack gap={6}>
              {/* Back Button */}
              {backButton && (
                <div>
                  {backButton.href ? (
                    <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm group">
                      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                      {backButton.label}
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      inverted={inverted}
                      onClick={backButton.onClick}
                      className="group"
                    >
                      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                      {backButton.label}
                    </Button>
                  )}
                </div>
              )}

              {/* Page Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <MarketingPageHeader
                    kicker={header.kicker}
                    title={header.title}
                    description={header.description}
                    inverted={inverted}
                    size="md"
                  />
                  {header.badge && <div className="mt-2">{header.badge}</div>}
                  {header.metadata && <div className="mt-4">{header.metadata}</div>}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 shrink-0">
                    {actions}
                  </div>
                )}
              </div>

              {/* Main Content */}
              {sidebar ? (
                <SplitLayout
                  main={mainContent}
                  aside={sidebarContent}
                  asidePosition={sidebarPosition}
                  asideWidth={sidebarWidth}
                  gap="lg"
                />
              ) : (
                mainContent
              )}
            </Stack>
          </Container>
        </main>
      </div>
    );
  }
);

DetailPage.displayName = "DetailPage";

export default DetailPage;
