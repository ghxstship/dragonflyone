"use client";

import { CreatorNavigationAuthenticated } from "../components/navigation";
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
      navigation={<CreatorNavigationAuthenticated />}
      appName="ATLVS"
      background="ink"
      showDashboard={true}
      dashboardPath="/dashboard"
    />
  );
}
