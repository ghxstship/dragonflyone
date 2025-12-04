"use client";

import { ReactNode } from "react";
import { CompvssAppLayout } from "../../../components/app-layout";

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
    <CompvssAppLayout variant="authenticated">
      {children}
    </CompvssAppLayout>
  );
}
