import type { ReactNode } from "react";

export interface SettingsSection {
  /**
   * Section ID
   */
  id: string;
  
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section icon
   */
  icon: ReactNode;
  
  /**
   * Optional description
   */
  description?: string;
}

export interface SettingsPageLayoutProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Back navigation URL
   */
  backHref?: string;
  
  /**
   * Back button label
   */
  backLabel?: string;
  
  /**
   * Array of settings sections
   */
  sections: SettingsSection[];
  
  /**
   * Currently active section ID
   */
  activeSection: string;
  
  /**
   * Section change handler
   */
  onSectionChange?: (sectionId: string) => void;
  
  /**
   * Main content
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
