import type { ReactNode } from "react";

export interface SettingsHubPageProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Main content
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
