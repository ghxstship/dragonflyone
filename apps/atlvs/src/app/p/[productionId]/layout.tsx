"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../../components/app-layout";

/**
 * Production Context Layout
 * Wraps all production-level pages with the appropriate navigation context
 */
export default function ProductionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AtlvsAppLayout variant="authenticated">
      {children}
    </AtlvsAppLayout>
  );
}
