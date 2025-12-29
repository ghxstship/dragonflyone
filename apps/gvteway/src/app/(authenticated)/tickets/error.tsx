"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function TicketsError({
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
      title="Tickets Error"
      description="There was a problem loading your tickets. Please try again."
    />
  );
}
