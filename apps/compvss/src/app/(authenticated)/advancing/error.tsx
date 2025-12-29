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
      appName="COMPVSS"
      background="black"
      showDashboard={true}
      dashboardPath="/dashboard"
      title="Advancing Error"
      description="There was a problem loading the advancing section. Please try again."
    />
  );
}
