"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Payments Layout - Enhanced Navigation Shell
 */
export default function PaymentsLayout({ children }: { children: ReactNode }) {
  return <AtlvsAppLayout variant="authenticated">{children}</AtlvsAppLayout>;
}
