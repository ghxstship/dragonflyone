/**
 * COMPVSS Error Configuration
 * Centralized configuration for all error and not-found pages
 */

export const errorConfig = {
  appName: "COMPVSS",
  background: "ink" as const, // Normalized from "black" to "ink"
  supportEmail: "support@compvss.com",
  dashboardPath: "/dashboard",
  homePath: "/",
  showDashboard: true,
  showSearch: true,
  searchPath: "/search",
  message: "The page you are looking for does not exist or has been moved. Return to your dashboard or use search to find what you need.",
};
