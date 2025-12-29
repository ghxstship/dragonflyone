"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AssetsError({
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
      title="Assets Error"
      description="There was a problem loading the assets section. Please try again."
    />
  );
}
