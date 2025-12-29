"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function CrewError({
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
      title="Crew Error"
      description="There was a problem loading the crew section. Please try again."
    />
  );
}
