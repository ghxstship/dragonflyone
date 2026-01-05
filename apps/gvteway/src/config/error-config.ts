/**
 * GVTEWAY Error Configuration
 * Centralized configuration for all error and not-found pages
 */

export const errorConfig = {
  appName: "GVTEWAY",
  background: "ink" as const, // Normalized from "black" to "ink"
  supportEmail: "support@gvteway.com",
  dashboardPath: "/dashboard",
  homePath: "/", // Normalized from "/events" to "/" for consistency
  showDashboard: false,
  showSearch: true,
  searchPath: "/search",
  message: "The page you are looking for does not exist or has been moved. Try browsing our events or use search to find what you need.",
};
