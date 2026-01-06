import { ReactNode, useState, useEffect } from "react";
import { AuthenticatedShell, AppLoadingLayout, AppEmptyLayout, AppSkeletonLayout } from "@ghxstship/ui";
import { 
  compvssSidebarNavigation,
  compvssQuickActions,
  compvssDemoOrganizations,
  compvssBottomNavigation,
} from "../data/compvss";
import HelpModal from "./HelpModal";

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated" | "portal";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: any[];
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
 * COMPVSS App Layout Configuration
 * Centralized configuration for shared layout components
 */
const compvssLayoutConfig = {
  appName: "COMPVSS",
  logo: (
    <a href="/" className="font-display text-xl uppercase tracking-tight text-white">
      COMPVSS
    </a>
  ),
  sidebarNavigation: compvssSidebarNavigation,
  inverted: true,
};

/**
 * CompvssAppLayout - Unified layout wrapper for all COMPVSS pages
 * Uses the shared AuthenticatedShell component to eliminate code duplication
 */
export function CompvssAppLayout(props: AppLayoutProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for help modal
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowHelpModal(true);
      }
      // Shift+? for help modal (common help shortcut)
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setShowHelpModal(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AuthenticatedShell
        {...props}
        sections={compvssSidebarNavigation}
        logo={compvssLayoutConfig.logo}
        inverted={true}
      />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}

export function CompvssLoadingLayout({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return <AppLoadingLayout text={text} config={compvssLayoutConfig} />;
}

export function CompvssEmptyLayout({
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
  return <AppEmptyLayout title={title} description={description} action={action} config={compvssLayoutConfig} />;
}

export function CompvssSkeletonLayout({
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
    <AppSkeletonLayout
      config={compvssLayoutConfig}
      showStats={showStats}
      showTable={showTable}
      showCards={showCards}
      cardCount={cardCount}
    />
  );
}

/**
 * COMPVSS-specific configuration for the shared app layout
 */
const compvssConfig: SharedAppLayoutConfig = {
  appId: "compvss",
  sidebarNavigation: compvssSidebarNavigation,
  quickActions: compvssQuickActions,
  demoData: {
    organizations: compvssDemoOrganizations,
  },
  bottomNavigation: compvssBottomNavigation,
  footerLinks: {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Security", href: "/security" },
      { label: "What's New", href: "/changelog" },
    ],
    resources: [
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/docs/api" },
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/guides" },
      { label: "Templates", href: "/templates" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
  actionCommands: [
    { label: "New Crew Member", href: "/crew/new", icon: null, shortcut: "C" },
    { label: "New Schedule", href: "/schedule/new", icon: null, shortcut: "S" },
    { label: "New Equipment", href: "/equipment/new", icon: null, shortcut: "E" },
    { label: "Search", href: "/search", icon: null, shortcut: "/" },
  ],
};
