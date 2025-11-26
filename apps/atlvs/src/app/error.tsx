"use client";

import { Navigation } from "../components/navigation";
import { ErrorPage } from "@ghxstship/ui";

export default function Error({
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
      navigation={<Navigation />}
      appName="ATLVS"
      background="ink"
      showDashboard={true}
      dashboardPath="/dashboard"
    />
  );
}
