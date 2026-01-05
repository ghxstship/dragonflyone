import type { HTMLAttributes, ReactNode } from "react";

export interface ScrollableTableWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to wrap (typically a Table component) */
  children: ReactNode;
  /** Show scroll hint text on mobile */
  showHint?: boolean;
  /** Custom hint text */
  hintText?: string;
}
