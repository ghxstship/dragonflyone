"use client";

import { ReactNode } from "react";
import { GvtewayAppLayout } from "../../../components/app-layout";

/**
 * Event Context Layout
 * Wraps all event-level pages with the appropriate navigation context
 */
export default function EventLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GvtewayAppLayout variant="consumer-auth">
      {children}
    </GvtewayAppLayout>
  );
}
