import type { ReactNode } from "react";

export interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}
