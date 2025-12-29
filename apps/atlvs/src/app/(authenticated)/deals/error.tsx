"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function DealsError({
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
      title="Deals Error"
      description="There was a problem loading the deals section. Please try again."
    />
  );
}
