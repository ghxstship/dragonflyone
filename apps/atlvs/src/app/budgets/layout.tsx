"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Budgets Layout - Enhanced Navigation Shell
 */
export default function BudgetsLayout({ children }: { children: ReactNode }) {
  return <AtlvsAppLayout variant="authenticated">{children}</AtlvsAppLayout>;
}
