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
      appName="COMPVSS"
      background="black"
      showDashboard={true}
      dashboardPath="/dashboard"
    />
  );
}
