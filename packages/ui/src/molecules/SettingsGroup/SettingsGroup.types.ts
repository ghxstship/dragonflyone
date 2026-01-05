import type { ReactNode } from "react";

export interface SettingsGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}
