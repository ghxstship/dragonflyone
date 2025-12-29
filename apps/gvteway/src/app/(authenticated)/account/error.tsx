"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AccountError({
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
      title="Account Error"
      description="There was a problem loading your account. Please try again."
    />
  );
}
