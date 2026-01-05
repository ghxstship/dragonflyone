import type { ReactNode, MouseEventHandler } from "react";

export interface TabProps {
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
}
