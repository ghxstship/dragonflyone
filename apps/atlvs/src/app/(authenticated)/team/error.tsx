"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function TeamError({
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
      title="Team Error"
      description="There was a problem loading the team section. Please try again."
    />
  );
}
