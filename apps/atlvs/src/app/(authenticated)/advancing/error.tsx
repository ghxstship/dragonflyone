"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AdvancingError({
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
      title="Advancing Error"
      description="There was a problem loading the advancing section. Please try again."
    />
  );
}
