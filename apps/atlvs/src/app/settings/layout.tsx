"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Settings Layout
 * Wraps all settings pages with the ATLVS navigation shell
 */
export default function SettingsLayout({
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
