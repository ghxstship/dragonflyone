"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function SettingsError({
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
      title="Settings Error"
      description="There was a problem loading the settings section. Please try again."
    />
  );
}
