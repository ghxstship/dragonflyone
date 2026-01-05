import type { ReactNode } from "react";

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  background?: "black" | "white";
}
