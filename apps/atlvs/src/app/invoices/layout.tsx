"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Invoices Layout - Enhanced Navigation Shell
 */
export default function InvoicesLayout({ children }: { children: ReactNode }) {
  return <AtlvsAppLayout variant="authenticated">{children}</AtlvsAppLayout>;
}
