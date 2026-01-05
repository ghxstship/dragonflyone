import type { ReactNode } from "react";

export interface TabPanelProps {
  active?: boolean;
  children: ReactNode;
  className?: string;
}
