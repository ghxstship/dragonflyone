"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function FinanceError({
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
      title="Finance Error"
      description="There was a problem loading the finance section. Please try again."
    />
  );
}
