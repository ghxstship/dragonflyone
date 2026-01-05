import type { HTMLAttributes, ReactNode } from "react";

/**
 * Service card background variant
 */
export type ServiceCardBackground = "default" | "inverted" | "muted";

/**
 * ServiceCard component props
 */
export interface ServiceCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  title: string;
  description: string;
  background?: ServiceCardBackground;
  inverted?: boolean;
}
