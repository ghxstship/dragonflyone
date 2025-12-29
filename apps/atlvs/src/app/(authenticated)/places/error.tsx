"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function PlacesError({
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
      title="Places Error"
      description="There was a problem loading the places section. Please try again."
    />
  );
}
