"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function EventsError({
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
      title="Events Error"
      description="There was a problem loading the events section. Please try again."
    />
  );
}
