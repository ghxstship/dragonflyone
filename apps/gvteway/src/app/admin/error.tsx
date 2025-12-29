"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AdminError({
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
      title="Admin Error"
      description="There was a problem loading the admin section. Please try again."
    />
  );
}
