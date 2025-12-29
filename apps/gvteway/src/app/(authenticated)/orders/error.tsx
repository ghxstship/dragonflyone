"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function OrdersError({
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
      title="Orders Error"
      description="There was a problem loading your orders. Please try again."
    />
  );
}
