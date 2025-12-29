"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function ProductionsError({
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
      title="Productions Error"
      description="There was a problem loading the productions section. Please try again."
    />
  );
}
