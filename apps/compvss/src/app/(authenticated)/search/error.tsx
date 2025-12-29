"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function SearchError({
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
      title="Search Error"
      description="There was a problem with the search. Please try again."
    />
  );
}
