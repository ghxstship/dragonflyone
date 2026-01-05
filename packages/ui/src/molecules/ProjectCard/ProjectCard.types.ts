import type { HTMLAttributes } from "react";

/**
 * ProjectCard component props
 */
export interface ProjectCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  image: string;
  imageAlt?: string;
  metadata?: string;
  tags?: string[];
  href?: string;
  onClick?: () => void;
  inverted?: boolean;
}
