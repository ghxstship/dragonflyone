"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function EquipmentError({
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
      title="Equipment Error"
      description="There was a problem loading the equipment section. Please try again."
    />
  );
}
