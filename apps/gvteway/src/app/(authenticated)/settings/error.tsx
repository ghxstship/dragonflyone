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
      appName="GVTEWAY"
      background="black"
      showDashboard={false}
      title="Settings Error"
      description="There was a problem loading the settings. Please try again."
    />
  );
}
