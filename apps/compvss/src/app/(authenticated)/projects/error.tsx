"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function ProjectsError({
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
      title="Projects Error"
      description="There was a problem loading the projects section. Please try again."
    />
  );
}
