/**
 * Base Error Configuration Types
 * Centralized type definitions for error and not-found page configurations
 * Used across ATLVS, COMPVSS, and GVTEWAY applications
 */

export interface BaseErrorConfig {
  /** Application name displayed in error navigation */
  appName: string;
  
  /** Background theme for error pages */
  background: "ink" | "black" | "gradient";
  
  /** Support email for error reporting */
  supportEmail: string;
  
  /** Path to dashboard (if applicable) */
  dashboardPath: string;
  
  /** Path to home page */
  homePath: string;
  
  /** Whether to show dashboard link in error navigation */
  showDashboard: boolean;
  
  /** Whether to show search link in error navigation */
  showSearch: boolean;
  
  /** Path to search page */
  searchPath: string;
  
  /** Custom error message for 404 pages */
  message: string;
}

export interface ErrorNavbarConfig {
  appName: string;
  homePath: string;
  showDashboard?: boolean;
  dashboardPath?: string;
  showSearch?: boolean;
  searchPath?: string;
  inverted?: boolean;
}

/**
 * Default error configuration values
 * Can be extended by app-specific configurations
 */
export const defaultErrorConfig: Partial<BaseErrorConfig> = {
  background: "ink",
  dashboardPath: "/dashboard",
  homePath: "/",
  showDashboard: true,
  showSearch: true,
  searchPath: "/search",
  message: "The page you are looking for does not exist or has been moved. Return to your dashboard or use search to find what you need.",
};
