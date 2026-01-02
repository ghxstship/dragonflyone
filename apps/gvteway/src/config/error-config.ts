/**
 * GVTEWAY Error Configuration
 * Centralized configuration for all error and not-found pages
 */

export const errorConfig = {
  appName: "GVTEWAY",
  background: "black" as const,
  supportEmail: "support@gvteway.com",
  dashboardPath: "/dashboard",
  homePath: "/events",
  showDashboard: false,
  showSearch: true,
  searchPath: "/search",
  message:
    "The page you are looking for does not exist or has been moved. Try browsing our events or use search to find what you need.",
};
