'use client';

import { AppProviders } from '@ghxstship/config/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
