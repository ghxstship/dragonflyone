"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function ScheduleError({
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
      title="Schedule Error"
      description="There was a problem loading the schedule section. Please try again."
    />
  );
}
