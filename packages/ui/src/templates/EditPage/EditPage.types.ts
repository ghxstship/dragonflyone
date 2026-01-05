import type { ReactNode } from "react";

export interface EditPageProps {
  /**
   * Page title displayed in the header
   */
  title: string;
  
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  
  /**
   * URL for the back navigation button
   */
  backHref?: string;
  
  /**
   * Label for the back button
   */
  backLabel?: string;
  
  /**
   * Label for the save button
   */
  saveLabel?: string;
  
  /**
   * Save handler function
   */
  onSave?: () => void | Promise<void>;
  
  /**
   * Whether the save operation is in progress
   */
  saving?: boolean;
  
  /**
   * Whether the form is disabled
   */
  disabled?: boolean;
  
  /**
   * Main content of the page
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional action buttons
   */
  actions?: ReactNode;
  
  /**
   * Breadcrumb navigation items
   */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}
