"use client";

import { AppProviders } from "@ghxstship/config/providers";
import { WhitelabelThemeProvider } from "@ghxstship/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WhitelabelThemeProvider defaultColorMode="system">
      <AppProviders platform="compvss">{children}</AppProviders>
    </WhitelabelThemeProvider>
  );
}
