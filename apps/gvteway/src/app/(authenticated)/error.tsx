"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function AuthenticatedError({
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
    />
  );
}
