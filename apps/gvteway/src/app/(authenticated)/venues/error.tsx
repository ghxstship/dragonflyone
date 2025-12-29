"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function VenuesError({
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
      title="Venues Error"
      description="There was a problem loading the venues. Please try again."
    />
  );
}
