import type { ReactNode } from "react";

export interface HubItem {
  /**
   * Hub title
   */
  title: string;
  
  /**
   * Hub description
   */
  description: string;
  
  /**
   * Icon component
   */
  icon: ReactNode;
  
  /**
   * Click handler
   */
  onClick: () => void;
  
  /**
   * Optional footer content
   */
  footer?: ReactNode;
}

export interface HubPageProps {
  /**
   * Page title
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Array of hub items
   */
  hubs: HubItem[];
  
  /**
   * Optional action buttons
   */
  actions?: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
