"use client";

import { forwardRef, ReactNode, useState } from "react";
import clsx from "clsx";
import { Container, Stack } from "../foundations/layout.js";
import { PageHeader, SplitLayout } from "../foundations/page-regions.js";
import { Tabs, TabsList, Tab, TabPanel } from "../molecules/tabs.js";
import { Button } from "../atoms/button.js";
import { Link } from "../atoms/link.js";

export interface DetailPageTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface DetailPageProps {
  /** Navigation component */
  navigation?: ReactNode;
  /** Page header props */
  header: {
    kicker?: string;
    title: string;
    description?: string;
  };
  /** Primary action buttons */
  actions?: ReactNode;
  /** Back button config */
  backButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Main content (if not using tabs) */
  children?: ReactNode;
  /** Tab configuration (alternative to children) */
  tabs?: DetailPageTab[];
  /** Default active tab index */
  defaultTabIndex?: number;
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Sidebar position */
  sidebarPosition?: "left" | "right";
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * DetailPage template - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Entity detail view with optional tabs
 * - Optional sidebar for metadata/actions
 * - Integrated page header with back navigation
 * - Dark-first design
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
      sidebar,
      sidebarPosition = "right",
      inverted = true,
      className,
    },
    ref
  ) {
    const [activeTab, setActiveTab] = useState(defaultTabIndex);
    const bgClass = inverted ? "bg-ink-950 text-white" : "bg-white text-black";

    const mainContent = tabs ? (
      <Tabs inverted={inverted}>
        <TabsList inverted={inverted} className="mb-6">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              active={activeTab === index}
              inverted={inverted}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabsList>
        {tabs.map((tab, index) => (
          <TabPanel key={tab.id} active={activeTab === index} inverted={inverted}>
            {tab.content}
          </TabPanel>
        ))}
      </Tabs>
    ) : (
      children
    );

    return (
      <div
        ref={ref}
        className={clsx("min-h-screen", bgClass, className)}
      >
        {navigation}

        <Container className="py-6 md:py-8">
          <Stack gap={6}>
            {/* Back Button */}
            {backButton && (
              <div>
                {backButton.href ? (
                  <Link href={backButton.href} className="inline-flex items-center gap-2 text-sm">
                    ← {backButton.label}
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    inverted={inverted}
                    onClick={backButton.onClick}
                  >
                    ← {backButton.label}
                  </Button>
                )}
              </div>
            )}

            {/* Page Header */}
            <PageHeader
              kicker={header.kicker}
              title={header.title}
              description={header.description}
              actions={actions}
              inverted={inverted}
              size="md"
            />

            {/* Main Content */}
            {sidebar ? (
              <SplitLayout
                main={mainContent}
                aside={sidebar}
                asidePosition={sidebarPosition}
                asideWidth={4}
                gap="lg"
              />
            ) : (
              mainContent
            )}
          </Stack>
        </Container>
      </div>
    );
  }
);

export default DetailPage;
