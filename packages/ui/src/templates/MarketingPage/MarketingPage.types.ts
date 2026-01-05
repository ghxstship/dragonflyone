import type { ReactNode } from "react";

export interface MarketingSection {
  id: string;
  background: "white" | "black" | "ink" | "gradient";
  content: ReactNode;
  pattern?: "grid" | "halftone" | "stripes" | "none";
  patternOpacity?: number;
}

export interface MarketingPageProps {
  /**
   * Page title (legacy API)
   */
  title?: string;
  
  /**
   * Optional subtitle (legacy API)
   */
  subtitle?: string;
  
  /**
   * Main content (legacy API)
   */
  children?: ReactNode;
  
  /**
   * Marketing sections (new API)
   */
  sections?: MarketingSection[];
  
  /**
   * Whether to invert colors for dark theme
   */
  inverted?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
