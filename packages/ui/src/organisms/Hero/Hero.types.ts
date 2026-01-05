import type { HTMLAttributes, ReactNode } from "react";

export type HeroProps = HTMLAttributes<HTMLElement> & {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  cta?: ReactNode;
  background?: "white" | "black";
  pattern?: "halftone" | "grid" | "stripes" | "benday" | "none";
  fullHeight?: boolean;
};
