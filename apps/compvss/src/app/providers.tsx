'use client';

import { AppProviders } from '@ghxstship/config/providers';
import { ThemeProvider } from '@ghxstship/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppProviders platform="compvss">{children}</AppProviders>
    </ThemeProvider>
  );
}
