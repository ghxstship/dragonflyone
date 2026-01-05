import type { ReactNode } from "react";

export interface FooterLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}
