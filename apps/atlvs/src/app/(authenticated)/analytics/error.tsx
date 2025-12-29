"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      appName="ATLVS"
      background="ink"
      showDashboard={true}
      dashboardPath="/dashboard"
      title="Analytics Error"
      description="There was a problem loading the analytics section. Please try again."
    />
  );
}
