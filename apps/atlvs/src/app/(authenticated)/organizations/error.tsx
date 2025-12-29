"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function OrganizationsError({
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
      title="Organizations Error"
      description="There was a problem loading the organizations section. Please try again."
    />
  );
}
