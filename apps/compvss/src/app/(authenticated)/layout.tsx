"use client";

import { ReactNode } from "react";
import { CompvssAppLayout } from "../../components/app-layout";

/**
 * Authenticated Route Group Layout
 * Wraps all authenticated pages with the COMPVSS navigation shell
 * 
 * This layout applies to all pages under the (authenticated) route group,
 * ensuring consistent navigation, role-based filtering, favorites, 
 * recent pages, and all enhanced navigation features.
 */
export default function AuthenticatedLayout({
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
