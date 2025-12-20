"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Reports Layout - Enhanced Navigation Shell
 */
export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <AtlvsAppLayout variant="authenticated">{children}</AtlvsAppLayout>;
}
